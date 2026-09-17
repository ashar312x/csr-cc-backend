import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { MetricLog } from './metric-log.model';

@Table({
  tableName: 'metric_log_attachment',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  updatedAt: false,
})
export class MetricLogAttachment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => MetricLog)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare metricLogId: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare fileName: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare sizeBytes: number;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare storagePath: string;

  @CreatedAt
  declare createdAt: Date;

  @BelongsTo(() => MetricLog, { foreignKey: 'metricLogId', as: 'metricLog' })
  declare metricLog: MetricLog;
}
