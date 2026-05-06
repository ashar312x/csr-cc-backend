import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from '@app/repositories/category.repository';
import { ModuleType } from '@app/models/category.model';

const mockCategoryRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  findTrees: jest.fn(),
  findWithChildren: jest.fn(),
  findDirectChildren: jest.fn(),
  findDescendants: jest.fn(),
  updateSpecialStatus: jest.fn(),
  findSpecial: jest.fn(),
};

const adminUser = { sub: 1, email: 'admin@test.com', role: 'admin' };
const ownerUser = { sub: 2, email: 'owner@test.com', role: 'user' };
const otherUser = { sub: 3, email: 'other@test.com', role: 'user' };

const mockRootCategory = {
  id: 1,
  name: 'Root',
  parentId: null,
  moduleType: ModuleType.CSR,
  isSpecial: false,
  userId: ownerUser.sub,
  toJSON: () => ({ id: 1, name: 'Root', parentId: null, moduleType: ModuleType.CSR, isSpecial: false, userId: ownerUser.sub, children: [] }),
  destroy: jest.fn(),
};

const mockChildCategory = {
  id: 2,
  name: 'Child',
  parentId: 1,
  moduleType: ModuleType.CSR,
  isSpecial: false,
  userId: ownerUser.sub,
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoryRepository, useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { name: 'Root', moduleType: ModuleType.CSR };

    it('creates a root category without parentId', async () => {
      mockCategoryRepository.create.mockResolvedValue(mockRootCategory);

      const result = await service.create(dto, ownerUser.sub);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId: ownerUser.sub,
        isSpecial: false,
      });
      expect(result).toEqual(mockRootCategory);
    });

    it('throws NotFoundException when parentId references non-existent category', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...dto, parentId: 99 }, ownerUser.sub),
      ).rejects.toThrow(new NotFoundException('CATEGORY_NOT_FOUND'));
    });

    it('throws UnprocessableEntityException when child moduleType mismatches parent', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockRootCategory, moduleType: ModuleType.CC });

      await expect(
        service.create({ name: 'Child', moduleType: ModuleType.CSR, parentId: 1 }, ownerUser.sub),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('defaults isSpecial to false when not provided', async () => {
      mockCategoryRepository.create.mockResolvedValue(mockRootCategory);

      await service.create(dto, ownerUser.sub);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isSpecial: false }),
      );
    });
  });

  // ─── findAllRoots ─────────────────────────────────────────────────────────────

  describe('findAllRoots', () => {
    it('returns flat root list without includeChildren', async () => {
      mockCategoryRepository.findAll.mockResolvedValue({ rows: [mockRootCategory], count: 1 });

      const result = await service.findAllRoots({});

      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentId: null } }),
      );
      expect(result).toEqual([mockRootCategory]);
    });

    it('uses findTrees when includeChildren=true and moduleType is provided', async () => {
      mockCategoryRepository.findTrees.mockResolvedValue([mockRootCategory]);

      const result = await service.findAllRoots({ includeChildren: true, moduleType: ModuleType.CSR });

      expect(mockCategoryRepository.findTrees).toHaveBeenCalledWith(ModuleType.CSR);
      expect(result).toEqual([mockRootCategory]);
    });

    it('applies moduleType filter when provided without includeChildren', async () => {
      mockCategoryRepository.findAll.mockResolvedValue({ rows: [mockRootCategory], count: 1 });

      await service.findAllRoots({ moduleType: ModuleType.CSR });

      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentId: null, moduleType: ModuleType.CSR } }),
      );
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the category by id', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);

      const result = await service.findOne(1, false);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRootCategory);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(99, false)).rejects.toThrow(
        new NotFoundException('CATEGORY_NOT_FOUND'),
      );
    });

    it('loads subtree when includeChildren=true', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findWithChildren.mockResolvedValue({
        ...mockRootCategory,
        toJSON: () => ({ ...mockRootCategory.toJSON(), children: [] }),
      });

      await service.findOne(1, true);

      expect(mockCategoryRepository.findWithChildren).toHaveBeenCalledWith(1);
    });
  });

  // ─── findChildren ────────────────────────────────────────────────────────────

  describe('findChildren', () => {
    it('returns direct children for a valid parent', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([mockChildCategory]);

      const result = await service.findChildren(1);

      expect(result).toEqual([mockChildCategory]);
    });

    it('throws NotFoundException when parent does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findChildren(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findDescendants ─────────────────────────────────────────────────────────

  describe('findDescendants', () => {
    it('returns descendants from the repository', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findDescendants.mockResolvedValue([{ ...mockChildCategory, depth: 1 }]);

      const result = await service.findDescendants(1);

      expect(mockCategoryRepository.findDescendants).toHaveBeenCalledWith(1);
      expect(result[0]).toHaveProperty('depth', 1);
    });

    it('throws NotFoundException when ancestor does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findDescendants(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto = { name: 'Updated Name' };

    it('allows the owner to update', async () => {
      mockCategoryRepository.findById
        .mockResolvedValueOnce(mockRootCategory)
        .mockResolvedValueOnce({ ...mockRootCategory, name: 'Updated Name' });
      mockCategoryRepository.update.mockResolvedValue([1]);

      const result = await service.update(1, dto, ownerUser);

      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated Name');
    });

    it('allows admin to update any category', async () => {
      mockCategoryRepository.findById
        .mockResolvedValueOnce(mockRootCategory)
        .mockResolvedValueOnce(mockRootCategory);
      mockCategoryRepository.update.mockResolvedValue([1]);

      await expect(service.update(1, dto, adminUser)).resolves.not.toThrow();
    });

    it('throws ForbiddenException for non-owner non-admin', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);

      await expect(service.update(1, dto, otherUser)).rejects.toThrow(
        new ForbiddenException('CATEGORY_UPDATE_FORBIDDEN'),
      );
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.update(99, dto, ownerUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes a leaf category (no children)', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([]);

      await service.remove(1, false, ownerUser);

      expect(mockRootCategory.destroy).toHaveBeenCalled();
    });

    it('throws BadRequestException when category has children and force=false', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([mockChildCategory]);

      await expect(service.remove(1, false, ownerUser)).rejects.toThrow(
        new BadRequestException('CATEGORY_HAS_CHILDREN'),
      );
    });

    it('deletes with children when force=true', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);
      mockCategoryRepository.findDirectChildren.mockResolvedValue([mockChildCategory]);

      await service.remove(1, true, ownerUser);

      expect(mockRootCategory.destroy).toHaveBeenCalled();
    });

    it('throws ForbiddenException for non-owner', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);

      await expect(service.remove(1, false, otherUser)).rejects.toThrow(
        new ForbiddenException('CATEGORY_DELETE_FORBIDDEN'),
      );
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.remove(99, false, ownerUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── toggleSpecial ────────────────────────────────────────────────────────────

  describe('toggleSpecial', () => {
    it('sets isSpecial on the category', async () => {
      mockCategoryRepository.findById
        .mockResolvedValueOnce(mockRootCategory)
        .mockResolvedValueOnce({ ...mockRootCategory, isSpecial: true });
      mockCategoryRepository.updateSpecialStatus.mockResolvedValue([1]);

      const result = await service.toggleSpecial(1, true, ownerUser);

      expect(mockCategoryRepository.updateSpecialStatus).toHaveBeenCalledWith(1, true);
      expect(result.isSpecial).toBe(true);
    });

    it('throws ForbiddenException for non-owner', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockRootCategory);

      await expect(service.toggleSpecial(1, true, otherUser)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.toggleSpecial(99, true, ownerUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findSpecial ─────────────────────────────────────────────────────────────

  describe('findSpecial', () => {
    it('returns all special categories', async () => {
      const special = [{ ...mockRootCategory, isSpecial: true }];
      mockCategoryRepository.findSpecial.mockResolvedValue(special);

      const result = await service.findSpecial();

      expect(mockCategoryRepository.findSpecial).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(special);
    });

    it('filters by moduleType when provided', async () => {
      mockCategoryRepository.findSpecial.mockResolvedValue([]);

      await service.findSpecial(ModuleType.CC);

      expect(mockCategoryRepository.findSpecial).toHaveBeenCalledWith(ModuleType.CC);
    });
  });
});
