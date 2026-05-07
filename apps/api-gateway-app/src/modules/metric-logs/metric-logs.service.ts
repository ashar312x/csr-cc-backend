import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MetricLogRepository } from '@app/repositories/metric-log.repository';
import { CategoryRepository } from '@app/repositories/category.repository';
import { MetricLog } from '@app/models/metric-log.model';
import { PaginatedResponse } from '@app/common/interfaces/pagination.interface';
import { CreateMetricLogDto } from './dto/create-metric-log.dto';
import { CreateBulkMetricLogDto } from './dto/create-bulk-metric-log.dto';
import { UpdateMetricLogDto } from './dto/update-metric-log.dto';
import { MetricLogQueryDto } from './dto/metric-log-query.dto';
import { MetricLogResponseDto, MetricLogSummaryDto } from './dto/metric-log-response.dto';

@Injectable()
export class MetricLogsService {
  constructor(
    private readonly metricLogRepository: MetricLogRepository,
    private readonly categoryRepository: CategoryRepository,
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
