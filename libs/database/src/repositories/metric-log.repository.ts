import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col, Op, WhereOptions } from 'sequelize';
import { MetricLog } from '../models/metric-log.model';
import { Category } from '../models/category.model';

export interface SummaryItem {
  categoryId: number;
  categoryName: string;
  total: number;
  average: number;
  count: number;
}

interface MetricPagination {
  limit?: number;
  offset?: number;
  page?: number;
  size?: number;
  where?: Record<string, any>;
}

interface SaveMetricDto {
  categoryId: number;
  value: number;
  entryDate: string;
}

interface ComparisonFilters {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  isSpecial?: boolean;
}

@Injectable()
export class MetricLogRepository {
  constructor(
    @InjectModel(MetricLog) private readonly metricLogModel: typeof MetricLog,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  create(dto: Partial<MetricLog['_creationAttributes']>) {
    return this.metricLogModel.create(dto as any);
  }

  findById(id: number) {
    return this.metricLogModel.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  async findAll(pagination: MetricPagination = {}) {
    const limit = pagination.size ?? pagination.limit ?? 10;
    const offset =
      pagination.page != null
        ? (pagination.page - 1) * limit
        : (pagination.offset ?? 0);
    const { rows, count } = await this.metricLogModel.findAndCountAll({
      where: pagination.where,
      limit,
      offset,
      include: [{ model: Category, as: 'category' }],
    });
    return { rows, count, totalPages: Math.ceil(count / limit) };
  }

  update(id: number, dto: Partial<MetricLog['_creationAttributes']>) {
    return this.metricLogModel.update(dto as any, { where: { id } });
  }

  bulkCreate(dtos: Partial<MetricLog['_creationAttributes']>[]) {
    return this.metricLogModel.bulkCreate(dtos as any[]);
  }

  async saveMetric(dto: SaveMetricDto) {
    const childCount = await this.categoryModel.count({
      where: { parentId: dto.categoryId },
    });
    if (childCount > 0) {
      throw new BadRequestException('METRIC_CATEGORY_MUST_BE_LEAF');
    }
    return this.metricLogModel.create(dto as any);
  }

  getComparisonStats(categoryId: number, startDate: string, endDate: string) {
    return this.metricLogModel.findAll({
      attributes: ['entryDate', [fn('SUM', col('value')), 'total']],
      where: {
        categoryId,
        entryDate: { [Op.between]: [startDate, endDate] },
      },
      group: ['entryDate'],
      order: [['entryDate', 'ASC']],
      raw: true,
    });
  }

  async findAllForUser(
    userId: number,
    filters: {
      categoryId?: number;
      from?: string;
      to?: string;
      page: number;
      limit: number;
    },
  ): Promise<{ rows: MetricLog[]; count: number }> {
    const metricWhere: WhereOptions = {};
    if (filters.categoryId) (metricWhere as any).categoryId = filters.categoryId;
    if (filters.from && filters.to) {
      (metricWhere as any).entryDate = { [Op.between]: [filters.from, filters.to] };
    } else if (filters.from) {
      (metricWhere as any).entryDate = { [Op.gte]: filters.from };
    } else if (filters.to) {
      (metricWhere as any).entryDate = { [Op.lte]: filters.to };
    }
    const offset = (filters.page - 1) * filters.limit;
    const { rows, count } = await this.metricLogModel.findAndCountAll({
      where: metricWhere,
      include: [
        {
          model: Category,
          as: 'category',
          where: { userId },
          required: true,
        },
      ],
      limit: filters.limit,
      offset,
    });
    return { rows, count };
  }

  async getSummary(userId: number, from?: string, to?: string): Promise<SummaryItem[]> {
    const dateWhere: WhereOptions = {};
    if (from && to) {
      (dateWhere as any).entryDate = { [Op.between]: [from, to] };
    } else if (from) {
      (dateWhere as any).entryDate = { [Op.gte]: from };
    } else if (to) {
      (dateWhere as any).entryDate = { [Op.lte]: to };
    }

    const rows = await this.metricLogModel.findAll({
      attributes: [
        'categoryId',
        [fn('SUM', col('MetricLog.value')), 'total'],
        [fn('AVG', col('MetricLog.value')), 'average'],
        [fn('COUNT', col('MetricLog.id')), 'count'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
          where: { userId },
          required: true,
        },
      ],
      where: Object.keys(dateWhere).length ? dateWhere : undefined,
      group: ['MetricLog.categoryId', 'category.id'],
      raw: true,
      nest: true,
    } as any);

    return (rows as any[]).map((row) => ({
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? '',
      total: Number(row.total),
      average: parseFloat(Number(row.average).toFixed(2)),
      count: Number(row.count),
    }));
  }

  getExportData(filters: ComparisonFilters) {
    const metricWhere: any = {};
    if (filters.categoryId != null) metricWhere.categoryId = filters.categoryId;
    if (filters.startDate && filters.endDate) {
      metricWhere.entryDate = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    }

    const categoryWhere =
      filters.isSpecial !== undefined
        ? { isSpecial: filters.isSpecial }
        : undefined;

    return this.metricLogModel.findAll({
      where: metricWhere,
      include: [
        {
          model: Category,
          as: 'category',
          where: categoryWhere,
          required: filters.isSpecial !== undefined,
        },
      ],
    });
  }
}
