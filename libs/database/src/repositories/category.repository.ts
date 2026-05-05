import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal, WhereOptions } from 'sequelize';
import { Category, ModuleType } from '../models/category.model';

interface CategoryPagination {
  limit?: number;
  offset?: number;
  page?: number;
  size?: number;
  where?: Record<string, any>;
}

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  create(dto: Partial<Category['_creationAttributes']>) {
    return this.categoryModel.create(dto as any);
  }

  findById(id: number) {
    return this.categoryModel.findByPk(id);
  }

  async findAll(pagination: CategoryPagination = {}) {
    const limit = pagination.size ?? pagination.limit ?? 10;
    const offset =
      pagination.page != null
        ? (pagination.page - 1) * limit
        : (pagination.offset ?? 0);
    const { rows, count } = await this.categoryModel.findAndCountAll({
      where: pagination.where,
      limit,
      offset,
    });
    return { rows, count, totalPages: Math.ceil(count / limit) };
  }

  update(id: number, dto: Partial<Category['_creationAttributes']>) {
    return this.categoryModel.update(dto as any, { where: { id } });
  }

  bulkCreate(dtos: Partial<Category['_creationAttributes']>[]) {
    return this.categoryModel.bulkCreate(dtos as any[]);
  }

  async findTrees(moduleType: ModuleType) {
    const nodes = await this.categoryModel.findAll({ where: { moduleType } });
    const map = new Map<number, any>();
    nodes.forEach((n) => map.set(n.id, { ...n.toJSON(), children: [] }));
    const roots: any[] = [];
    map.forEach((node) => {
      if (node.parentId == null) {
        roots.push(node);
      } else {
        const parent = map.get(node.parentId);
        if (parent) parent.children.push(node);
      }
    });
    return roots;
  }

  getLeafNodes(parentId?: number) {
    const where: any = {
      id: {
        [Op.notIn]: literal(
          '(SELECT DISTINCT parentId FROM category WHERE parentId IS NOT NULL)',
        ),
      },
    };
    if (parentId != null) where.parentId = parentId;
    return this.categoryModel.findAll({ where });
  }

  updateSpecialStatus(id: number, status: boolean) {
    return this.categoryModel.update({ isSpecial: status }, { where: { id } });
  }

  findWithChildren(id: number): Promise<Category | null> {
    return this.categoryModel.findOne({
      where: { id },
      include: [{ model: Category, as: 'children', required: false }],
    });
  }

  findDirectChildren(parentId: number): Promise<Category[]> {
    return this.categoryModel.findAll({ where: { parentId } });
  }

  async findDescendants(id: number): Promise<Array<Category & { depth: number }>> {
    const result: Array<Category & { depth: number }> = [];
    let frontier: number[] = [id];
    let depth = 0;
    while (frontier.length > 0) {
      depth += 1;
      const children = await this.categoryModel.findAll({
        where: { parentId: frontier },
      });
      if (children.length === 0) break;
      children.forEach((child) => result.push(Object.assign(child, { depth })));
      frontier = children.map((c) => c.id);
    }
    return result;
  }

  findSpecial(moduleType?: ModuleType): Promise<Category[]> {
    const where: WhereOptions = { isSpecial: true };
    if (moduleType) (where as any)['moduleType'] = moduleType;
    return this.categoryModel.findAll({ where });
  }
}
