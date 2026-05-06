import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MetricLogsService } from './metric-logs.service';
import { MetricLogRepository } from '@app/repositories/metric-log.repository';
import { CategoryRepository } from '@app/repositories/category.repository';

const mockMetricLogRepository = {
  saveMetric: jest.fn(),
  bulkCreate: jest.fn(),
  findAllForUser: jest.fn(),
  getSummary: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const mockCategoryRepository = {
  findById: jest.fn(),
  findDirectChildren: jest.fn(),
};

const userId = 1;
const otherUserId = 2;

const mockCategory = {
  id: 1,
  name: 'Leaf Category',
  userId,
  parentId: null,
};

const mockLog = {
  id: 1,
  categoryId: 1,
  title: 'Run',
  value: 5,
  entryDate: '2026-05-01',
  category: { ...mockCategory },
  destroy: jest.fn(),
};

describe('MetricLogsService', () => {
  let service: MetricLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricLogsService,
        { provide: MetricLogRepository, useValue: mockMetricLogRepository },
        { provide: CategoryRepository, useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<MetricLogsService>(MetricLogsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { categoryId: 1, title: 'Run', value: 5, entryDate: '2026-05-01' };

    it('creates a metric log for a valid leaf category', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockMetricLogRepository.saveMetric.mockResolvedValue(mockLog);

      const result = await service.create(dto, userId);

      expect(mockMetricLogRepository.saveMetric).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 1, title: 'Run', value: 5, entryDate: '2026-05-01' }),
      );
      expect(result).toEqual(mockLog);
    });

    it('defaults entryDate to today when not provided', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockMetricLogRepository.saveMetric.mockResolvedValue(mockLog);
      const today = new Date().toISOString().split('T')[0];

      await service.create({ categoryId: 1, title: 'Run', value: 5 }, userId);

      expect(mockMetricLogRepository.saveMetric).toHaveBeenCalledWith(
        expect.objectContaining({ entryDate: today }),
      );
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(
        new NotFoundException('CATEGORY_NOT_FOUND'),
      );
    });

    it('throws ForbiddenException when category belongs to another user', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory, userId: otherUserId });

      await expect(service.create(dto, userId)).rejects.toThrow(
        new ForbiddenException('METRIC_LOG_FORBIDDEN'),
      );
    });
  });

  // ─── bulkCreate ──────────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    const dto = {
      entries: [
        { categoryId: 1, title: 'Entry A', value: 3, entryDate: '2026-05-01' },
        { categoryId: 1, title: 'Entry B', value: 7, entryDate: '2026-05-02' },
      ],
    };

    it('bulk creates entries for valid leaf categories', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([]);
      mockMetricLogRepository.bulkCreate.mockResolvedValue([]);

      const result = await service.bulkCreate(dto, userId);

      expect(mockMetricLogRepository.bulkCreate).toHaveBeenCalled();
      expect(result).toEqual({ created: 2 });
    });

    it('throws NotFoundException when one category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.bulkCreate(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when a category belongs to another user', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory, userId: otherUserId });

      await expect(service.bulkCreate(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when a category is not a leaf node', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([{ id: 2 }]);

      await expect(service.bulkCreate(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns a paginated list for the user', async () => {
      mockMetricLogRepository.findAllForUser.mockResolvedValue({ rows: [mockLog], count: 1 });

      const result = await service.findAll({ page: 1, limit: 20 }, userId);

      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.totalItems).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('throws BadRequestException when from > to', async () => {
      await expect(
        service.findAll({ from: '2026-12-31', to: '2026-01-01', page: 1, limit: 20 }, userId),
      ).rejects.toThrow(new BadRequestException('from date must not be after to date'));
    });
  });

  // ─── getSummary ───────────────────────────────────────────────────────────────

  describe('getSummary', () => {
    const summary = [{ categoryId: 1, categoryName: 'Leaf', total: 10, average: 5, count: 2 }];

    it('returns aggregated summary per category', async () => {
      mockMetricLogRepository.getSummary.mockResolvedValue(summary);

      const result = await service.getSummary(userId);

      expect(mockMetricLogRepository.getSummary).toHaveBeenCalledWith(userId, undefined, undefined);
      expect(result).toEqual(summary);
    });

    it('passes date range to the repository', async () => {
      mockMetricLogRepository.getSummary.mockResolvedValue(summary);

      await service.getSummary(userId, '2026-01-01', '2026-12-31');

      expect(mockMetricLogRepository.getSummary).toHaveBeenCalledWith(userId, '2026-01-01', '2026-12-31');
    });

    it('throws BadRequestException when from > to', async () => {
      await expect(
        service.getSummary(userId, '2026-12-31', '2026-01-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the log when it belongs to the user', async () => {
      mockMetricLogRepository.findById.mockResolvedValue(mockLog);

      const result = await service.findOne(1, userId);

      expect(result).toEqual(mockLog);
    });

    it('throws NotFoundException when log does not exist', async () => {
      mockMetricLogRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(99, userId)).rejects.toThrow(
        new NotFoundException('METRIC_LOG_NOT_FOUND'),
      );
    });

    it('throws ForbiddenException when log belongs to another user', async () => {
      mockMetricLogRepository.findById.mockResolvedValue({
        ...mockLog,
        category: { ...mockCategory, userId: otherUserId },
      });

      await expect(service.findOne(1, userId)).rejects.toThrow(
        new ForbiddenException('METRIC_LOG_FORBIDDEN'),
      );
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto = { value: 10 };

    it('updates the log and returns refreshed record', async () => {
      mockMetricLogRepository.findById
        .mockResolvedValueOnce(mockLog)
        .mockResolvedValueOnce({ ...mockLog, value: 10 });
      mockMetricLogRepository.update.mockResolvedValue([1]);

      const result = await service.update(1, dto, userId);

      expect(mockMetricLogRepository.update).toHaveBeenCalledWith(1, dto);
      expect((result as any).value).toBe(10);
    });

    it('throws BadRequestException when no fields are provided', async () => {
      await expect(service.update(1, {}, userId)).rejects.toThrow(
        new BadRequestException('At least one field must be provided for update'),
      );
      expect(mockMetricLogRepository.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when log does not exist', async () => {
      mockMetricLogRepository.findById.mockResolvedValue(null);

      await expect(service.update(99, dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when log belongs to another user', async () => {
      mockMetricLogRepository.findById.mockResolvedValue({
        ...mockLog,
        category: { ...mockCategory, userId: otherUserId },
      });

      await expect(service.update(1, dto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('hard-deletes a log owned by the user', async () => {
      mockMetricLogRepository.findById.mockResolvedValue(mockLog);

      await service.remove(1, userId);

      expect(mockLog.destroy).toHaveBeenCalled();
    });

    it('throws NotFoundException when log does not exist', async () => {
      mockMetricLogRepository.findById.mockResolvedValue(null);

      await expect(service.remove(99, userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when log belongs to another user', async () => {
      mockMetricLogRepository.findById.mockResolvedValue({
        ...mockLog,
        category: { ...mockCategory, userId: otherUserId },
      });

      await expect(service.remove(1, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
