import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { MetricLogAttachment } from './metric-log-attachment.model';

@Table({
  tableName: 'metric_log',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
})
export class MetricLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare categoryId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare value: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare entryDate: string;

  @BelongsTo(() => Category, { foreignKey: 'categoryId', as: 'category' })
  declare category: Category;

  @HasMany(() => MetricLogAttachment, {
    foreignKey: 'metricLogId',
    as: 'attachments',
    onDelete: 'CASCADE',
  })
  declare attachments: MetricLogAttachment[];
}
