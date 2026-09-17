import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MetricLogRepository } from '@app/repositories/metric-log.repository';
import { CategoryRepository } from '@app/repositories/category.repository';
import { MetricLogAttachmentRepository } from '@app/repositories/metric-log-attachment.repository';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { MetricLog } from '@app/models/metric-log.model';
import { PaginatedResponse } from '@app/common/interfaces/pagination.interface';
import { CreateMetricLogDto } from './dto/create-metric-log.dto';
import { CreateBulkMetricLogDto } from './dto/create-bulk-metric-log.dto';
import { UpdateMetricLogDto } from './dto/update-metric-log.dto';
import { MetricLogQueryDto } from './dto/metric-log-query.dto';
import { MetricLogResponseDto, MetricLogSummaryDto } from './dto/metric-log-response.dto';

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);
const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

@Injectable()
export class MetricLogsService {
  constructor(
    private readonly metricLogRepository: MetricLogRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly metricLogAttachmentRepository: MetricLogAttachmentRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateMetricLogDto, userId: number): Promise<MetricLog> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    if (category.userId !== userId) throw new ForbiddenException('METRIC_LOG_FORBIDDEN');
    const entryDate = dto.entryDate ?? this.today();
    return this.metricLogRepository.saveMetric({
      categoryId: dto.categoryId,
      title: dto.title,
      value: dto.value,
      description: dto.description,
      entryDate,
    });
  }

  async bulkCreate(dto: CreateBulkMetricLogDto, userId: number): Promise<{ created: number }> {
    const distinctCategoryIds = [...new Set(dto.entries.map((e) => e.categoryId))];
    for (const catId of distinctCategoryIds) {
      const category = await this.categoryRepository.findById(catId);
      if (!category) throw new NotFoundException(`CATEGORY_NOT_FOUND: ${catId}`);
      if (category.userId !== userId) throw new ForbiddenException('METRIC_LOG_FORBIDDEN');
      const children = await this.categoryRepository.findDirectChildren(catId);
      if (children.length > 0) {
        throw new BadRequestException(`Category ${catId} is not a leaf node`);
      }
    }
    const rows = dto.entries.map((e) => ({
      ...e,
      entryDate: e.entryDate ?? this.today(),
    }));
    await this.metricLogRepository.bulkCreate(rows as any);
    return { created: rows.length };
  }

  async findAll(query: MetricLogQueryDto, userId: number): Promise<PaginatedResponse<MetricLogResponseDto>> {
    if (query.from && query.to && query.from > query.to) {
      throw new BadRequestException('from date must not be after to date');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { rows, count } = await this.metricLogRepository.findAllForUser(userId, {
      categoryId: query.categoryId,
      from: query.from,
      to: query.to,
      page,
      limit,
    });
    return {
      data: rows as any[],
      page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  async getSummary(userId: number, from?: string, to?: string): Promise<MetricLogSummaryDto[]> {
    if (from && to && from > to) {
      throw new BadRequestException('from date must not be after to date');
    }
    return this.metricLogRepository.getSummary(userId, from, to) as any;
  }

  async findOne(id: number, userId: number): Promise<MetricLog> {
    const log = await this.metricLogRepository.findById(id);
    if (!log) throw new NotFoundException('METRIC_LOG_NOT_FOUND');
    this.assertOwnership(log, userId);
    return log;
  }

  async addAttachment(
    metricLogId: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<MetricLog> {
    if (!file) throw new BadRequestException('METRIC_LOG_ATTACHMENT_FILE_REQUIRED');
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.mimetype) && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('METRIC_LOG_ATTACHMENT_INVALID_TYPE');
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new BadRequestException('METRIC_LOG_ATTACHMENT_INVALID_TYPE');
    }
    const log = await this.metricLogRepository.findById(metricLogId);
    if (!log) throw new NotFoundException('METRIC_LOG_NOT_FOUND');
    this.assertOwnership(log, userId);

    const uploaded = await this.fileUploadService.uploadFile(file, 'metric-log-attachments');
    await this.metricLogAttachmentRepository.create({
      metricLogId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath: uploaded.url,
    });
    return this.metricLogRepository.findById(metricLogId) as Promise<MetricLog>;
  }

  async removeAttachment(attachmentId: number, userId: number): Promise<void> {
    const attachment = await this.metricLogAttachmentRepository.findById(attachmentId);
    if (!attachment) throw new NotFoundException('METRIC_LOG_ATTACHMENT_NOT_FOUND');
    const log = await this.metricLogRepository.findById(attachment.metricLogId);
    if (!log) throw new NotFoundException('METRIC_LOG_NOT_FOUND');
    this.assertOwnership(log, userId);
    await this.metricLogAttachmentRepository.delete(attachmentId);

    const marker = '/uploads/';
    const markerIndex = attachment.storagePath.indexOf(marker);
    if (markerIndex !== -1) {
      const relativePath = attachment.storagePath.slice(markerIndex + 1);
      await fs.remove(path.join(process.cwd(), relativePath)).catch(() => undefined);
    }
  }

  async update(id: number, dto: UpdateMetricLogDto, userId: number): Promise<MetricLog> {
    const defined = Object.values(dto).filter((v) => v !== undefined);
    if (defined.length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }
    const log = await this.metricLogRepository.findById(id);
    if (!log) throw new NotFoundException('METRIC_LOG_NOT_FOUND');
    this.assertOwnership(log, userId);
    await this.metricLogRepository.update(id, dto as any);
    return this.metricLogRepository.findById(id) as Promise<MetricLog>;
  }

  async remove(id: number, userId: number): Promise<void> {
    const log = await this.metricLogRepository.findById(id);
    if (!log) throw new NotFoundException('METRIC_LOG_NOT_FOUND');
    this.assertOwnership(log, userId);
    await log.destroy();
  }

  private assertOwnership(log: MetricLog, userId: number) {
    const catUserId = (log as any).category?.userId;
    if (catUserId !== userId) throw new ForbiddenException('METRIC_LOG_FORBIDDEN');
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
