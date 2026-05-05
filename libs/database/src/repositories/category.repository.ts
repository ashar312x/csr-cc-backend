import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
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
    constructor(@InjectModel(Category) private readonly categoryModel: typeof Category) {}

    create(dto: Partial<Category['_creationAttributes']>) {
        return this.categoryModel.create(dto as any);
    }

    findById(id: number) {
        return this.categoryModel.findByPk(id);
    }

    async findAll(pagination: CategoryPagination = {}) {
        const limit = pagination.size ?? pagination.limit ?? 10;
        const offset = pagination.page != null
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
        nodes.forEach(n => map.set(n.id, { ...n.toJSON(), children: [] }));
        const roots: any[] = [];
        map.forEach(node => {
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
                [Op.notIn]: literal('(SELECT DISTINCT parentId FROM category WHERE parentId IS NOT NULL)'),
            },
        };
        if (parentId != null) where.parentId = parentId;
        return this.categoryModel.findAll({ where });
    }

    updateSpecialStatus(id: number, status: boolean) {
        return this.categoryModel.update({ isSpecial: status }, { where: { id } });
    }
}
