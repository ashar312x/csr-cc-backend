import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MetricLogAttachment } from '../models/metric-log-attachment.model';

@Injectable()
export class MetricLogAttachmentRepository {
  constructor(
    @InjectModel(MetricLogAttachment)
    private readonly metricLogAttachmentModel: typeof MetricLogAttachment,
  ) {}

  create(dto: Partial<MetricLogAttachment['_creationAttributes']>) {
    return this.metricLogAttachmentModel.create(dto as any);
  }

  findById(id: number) {
    return this.metricLogAttachmentModel.findByPk(id);
  }

  findByMetricLogId(metricLogId: number) {
    return this.metricLogAttachmentModel.findAll({ where: { metricLogId } });
  }

  bulkCreate(dtos: Partial<MetricLogAttachment['_creationAttributes']>[]) {
    return this.metricLogAttachmentModel.bulkCreate(dtos as any[]);
  }

  delete(id: number) {
    return this.metricLogAttachmentModel.destroy({ where: { id } });
  }
}
