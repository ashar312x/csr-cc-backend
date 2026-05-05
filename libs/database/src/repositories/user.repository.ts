import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';

interface UserPagination {
  limit?: number;
  offset?: number;
  page?: number;
  size?: number;
  where?: Record<string, any>;
}

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  create(dto: Partial<User['_creationAttributes']>) {
    return this.userModel.create(dto as any);
  }

  findById(id: number) {
    return this.userModel.findByPk(id);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  async findAll(pagination: UserPagination = {}) {
    const limit = pagination.size ?? pagination.limit ?? 10;
    const offset =
      pagination.page != null
        ? (pagination.page - 1) * limit
        : (pagination.offset ?? 0);
    const { rows, count } = await this.userModel.findAndCountAll({
      where: pagination.where,
      limit,
      offset,
    });
    return { rows, count, totalPages: Math.ceil(count / limit) };
  }

  update(id: number, dto: Partial<User['_creationAttributes']>) {
    return this.userModel.update(dto as any, { where: { id } });
  }

  bulkCreate(dtos: Partial<User['_creationAttributes']>[]) {
    return this.userModel.bulkCreate(dtos as any[]);
  }
}
