import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CategoryRepository } from '@app/repositories/category.repository';
import { ModuleType } from '@app/models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface RequestUser {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto, userId: number) {
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) throw new NotFoundException('CATEGORY_NOT_FOUND');
      if (parent.moduleType !== dto.moduleType) {
        throw new UnprocessableEntityException(
          'Child moduleType must match parent moduleType',
        );
      }
    }
    return this.categoryRepository.create({
      ...dto,
      userId,
      isSpecial: dto.isSpecial ?? false,
    });
  }

  async findAllRoots(query: { includeChildren?: boolean; moduleType?: ModuleType }) {
    if (query.includeChildren) {
      const moduleType = query.moduleType;
      if (moduleType) {
        return this.categoryRepository.findTrees(moduleType);
      }
      const roots = await this.categoryRepository.findAll({
        where: { parentId: null },
        limit: 1000,
      });
      return Promise.all(
        roots.rows.map((r) => this.loadSubtree(r.id)),
      );
    }
    const where: any = { parentId: null };
    if (query.moduleType) where.moduleType = query.moduleType;
    const result = await this.categoryRepository.findAll({ where, limit: 1000 });
    return result.rows;
  }

  async findOne(id: number, includeChildren?: boolean) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    if (includeChildren) return this.loadSubtree(id);
    return category;
  }

  async findChildren(id: number) {
    const parent = await this.categoryRepository.findById(id);
    if (!parent) throw new NotFoundException('CATEGORY_NOT_FOUND');
    return this.categoryRepository.findDirectChildren(id);
  }

  async findDescendants(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    return this.categoryRepository.findDescendants(id);
  }

  async update(id: number, dto: UpdateCategoryDto, user: RequestUser) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    this.assertOwnership(category.userId, user, 'CATEGORY_UPDATE_FORBIDDEN');
    await this.categoryRepository.update(id, dto as any);
    return this.categoryRepository.findById(id);
  }

  async remove(id: number, force: boolean, user: RequestUser) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    this.assertOwnership(category.userId, user, 'CATEGORY_DELETE_FORBIDDEN');
    const children = await this.categoryRepository.findDirectChildren(id);
    if (children.length > 0 && !force) {
      throw new BadRequestException('CATEGORY_HAS_CHILDREN');
    }
    await category.destroy();
  }

  async toggleSpecial(id: number, isSpecial: boolean, user: RequestUser) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    this.assertOwnership(category.userId, user, 'CATEGORY_UPDATE_FORBIDDEN');
    await this.categoryRepository.updateSpecialStatus(id, isSpecial);
    return this.categoryRepository.findById(id);
  }

  findSpecial(moduleType?: ModuleType) {
    return this.categoryRepository.findSpecial(moduleType);
  }

  private async loadSubtree(id: number): Promise<any> {
    const node = await this.categoryRepository.findWithChildren(id);
    if (!node) return null;
    const json: any = node.toJSON();
    json.children = await Promise.all(
      (json.children ?? []).map((child: any) => this.loadSubtree(child.id)),
    );
    return json;
  }

  private assertOwnership(ownerId: number, user: RequestUser, errorKey: string) {
    if (user.role !== 'admin' && ownerId !== user.sub) {
      throw new ForbiddenException(errorKey);
    }
  }
}
