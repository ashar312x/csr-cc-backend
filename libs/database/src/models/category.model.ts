import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, Default, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';
import { MetricLog } from './metric-log.model';
import { User } from './user.model';

export enum ModuleType {
    CSR = 'CSR',
    CC  = 'CC',
}

@Table({ tableName: 'category', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' })
export class Category extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @ForeignKey(() => Category)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare parentId: number;

    @Column({ type: DataType.ENUM('CSR', 'CC'), allowNull: false })
    declare moduleType: ModuleType;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare isSpecial: boolean;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare userId: number;

    @BelongsTo(() => Category, { foreignKey: 'parentId', as: 'parent' })
    declare parent: Category;

    @HasMany(() => Category, { foreignKey: 'parentId', as: 'children', onDelete: 'CASCADE' })
    declare children: Category[];

    @HasMany(() => MetricLog, { foreignKey: 'categoryId', as: 'metricLogs', onDelete: 'CASCADE' })
    declare metricLogs: MetricLog[];

    @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
    declare user: User;
}
