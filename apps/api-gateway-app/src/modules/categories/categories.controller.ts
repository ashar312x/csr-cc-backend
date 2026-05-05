import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { GatewayAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ToggleSpecialDto } from './dto/toggle-special.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ModuleType } from '@app/models/category.model';

type AuthRequest = Request & { user: { sub: number; email: string; role: string } };

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(GatewayAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  @ApiResponse({ status: 422, description: 'moduleType mismatch with parent' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.categoriesService.create(dto, req.user.sub);
    return { message: 'CATEGORY_CREATED', result, statusCode: HttpStatus.CREATED };
  }

  @Get()
  @ApiOperation({ summary: 'Get all root categories (parentId IS NULL)' })
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  @ApiQuery({ name: 'moduleType', required: false, enum: ModuleType })
  @ApiResponse({ status: 200, description: 'Root categories returned', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllRoots(@Query() query: CategoryQueryDto) {
    const result = await this.categoriesService.findAllRoots(query);
    return { message: 'CATEGORIES_FETCHED', result, statusCode: HttpStatus.OK };
  }

  // Static route MUST be before :id
  @Get('special')
  @ApiOperation({ summary: 'Get all categories where isSpecial=true' })
  @ApiQuery({ name: 'moduleType', required: false, enum: ModuleType })
  @ApiResponse({ status: 200, description: 'Special categories returned', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findSpecial(@Query('moduleType') moduleType?: ModuleType) {
    const result = await this.categoriesService.findSpecial(moduleType);
    return { message: 'SPECIAL_CATEGORIES_FETCHED', result, statusCode: HttpStatus.OK };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Category returned', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeChildren', new DefaultValuePipe(false), ParseBoolPipe) includeChildren: boolean,
  ) {
    const result = await this.categoriesService.findOne(id, includeChildren);
    return { message: 'CATEGORY_FETCHED', result, statusCode: HttpStatus.OK };
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct children of a category (depth 1 only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Direct children returned', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  async findChildren(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoriesService.findChildren(id);
    return { message: 'CATEGORY_CHILDREN_FETCHED', result, statusCode: HttpStatus.OK };
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get all descendants as a flat array with depth field' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Flat descendant list with depth', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ancestor category not found' })
  async findDescendants(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoriesService.findDescendants(id);
    return { message: 'CATEGORY_DESCENDANTS_FETCHED', result, statusCode: HttpStatus.OK };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category name, isSpecial, or moduleType (owner or admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or forbidden field' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not owner or admin' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.categoriesService.update(id, dto, req.user);
    return { message: 'CATEGORY_UPDATED', result, statusCode: HttpStatus.OK };
  }

  @Patch(':id/special')
  @ApiOperation({ summary: 'Set isSpecial flag (dedicated endpoint for audit intent)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ToggleSpecialDto })
  @ApiResponse({ status: 200, description: 'isSpecial updated', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not owner or admin' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async toggleSpecial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleSpecialDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.categoriesService.toggleSpecial(id, dto.isSpecial, req.user);
    return { message: 'CATEGORY_SPECIAL_UPDATED', result, statusCode: HttpStatus.OK };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category; pass ?force=true to cascade-delete subtree' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'force', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 400, description: 'Category has children — pass force=true' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not owner or admin' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('force', new DefaultValuePipe(false), ParseBoolPipe) force: boolean,
    @Req() req: AuthRequest,
  ) {
    await this.categoriesService.remove(id, force, req.user);
    return { message: 'CATEGORY_DELETED', result: null, statusCode: HttpStatus.OK };
  }
}
