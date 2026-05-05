import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, Default, HasMany } from 'sequelize-typescript';
import { Category } from './category.model';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER  = 'USER',
}

@Table({ tableName: 'user', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' })
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: false, field: 'password_hash' })
    declare passwordHash: string;

    @Column({ type: DataType.ENUM('ADMIN', 'USER'), allowNull: false })
    declare role: UserRole;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare accessForCC: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare accessForCSR: boolean;

    @HasMany(() => Category, { foreignKey: 'userId', as: 'categories' })
    declare categories: Category[];
}
