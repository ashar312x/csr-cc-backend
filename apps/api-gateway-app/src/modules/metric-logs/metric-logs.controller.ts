import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
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
import { MetricLogsService } from './metric-logs.service';
import { CreateMetricLogDto } from './dto/create-metric-log.dto';
import { CreateBulkMetricLogDto } from './dto/create-bulk-metric-log.dto';
import { UpdateMetricLogDto } from './dto/update-metric-log.dto';
import { MetricLogQueryDto } from './dto/metric-log-query.dto';
import { MetricLogResponseDto, MetricLogSummaryDto } from './dto/metric-log-response.dto';

type AuthRequest = Request & { user: { sub: number; email: string; role: string } };

@ApiTags('Metric Logs')
@ApiBearerAuth('access-token')
@UseGuards(GatewayAuthGuard)
@Controller('metric-logs')
export class MetricLogsController {
  constructor(private readonly metricLogsService: MetricLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a single metric log entry on a leaf category' })
  @ApiBody({ type: CreateMetricLogDto })
  @ApiResponse({ status: 201, description: 'Metric log created', type: MetricLogResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or not a leaf category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Category not owned by user' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(@Body() dto: CreateMetricLogDto, @Req() req: AuthRequest) {
    const result = await this.metricLogsService.create(dto, req.user.sub);
    return { message: 'METRIC_LOG_CREATED', result, statusCode: HttpStatus.CREATED };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk-create metric log entries (max 100 per request)' })
  @ApiBody({ type: CreateBulkMetricLogDto })
  @ApiResponse({ status: 201, description: 'All entries created', schema: { example: { created: 5 } } })
  @ApiResponse({ status: 400, description: 'Validation error, non-leaf category, or empty entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'One or more categories not owned by user' })
  @ApiResponse({ status: 404, description: 'One or more categories not found' })
  async bulkCreate(@Body() dto: CreateBulkMetricLogDto, @Req() req: AuthRequest) {
    const result = await this.metricLogsService.bulkCreate(dto, req.user.sub);
    return { message: 'METRIC_LOG_BULK_CREATED', result, statusCode: HttpStatus.CREATED };
  }

  @Get()
  @ApiOperation({ summary: 'List all metric logs for the authenticated user (paginated)' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2026-12-31' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated list of metric logs' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: MetricLogQueryDto, @Req() req: AuthRequest) {
    const result = await this.metricLogsService.findAll(query, req.user.sub);
    return { message: 'METRIC_LOG_LIST', result, statusCode: HttpStatus.OK };
  }

  // Static route MUST be before :id
  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated totals and averages grouped by category' })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2026-12-31' })
  @ApiResponse({ status: 200, description: 'Summary per category', type: [MetricLogSummaryDto] })
  @ApiResponse({ status: 400, description: 'Invalid date parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: AuthRequest,
  ) {
    const result = await this.metricLogsService.getSummary(req.user.sub, from, to);
    return { message: 'METRIC_LOG_SUMMARY', result, statusCode: HttpStatus.OK };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single metric log entry by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Metric log found', type: MetricLogResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Entry does not belong to user' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const result = await this.metricLogsService.findOne(id, req.user.sub);
    return { message: 'METRIC_LOG_DETAIL', result, statusCode: HttpStatus.OK };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a metric log entry (categoryId is immutable)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateMetricLogDto })
  @ApiResponse({ status: 200, description: 'Metric log updated', type: MetricLogResponseDto })
  @ApiResponse({ status: 400, description: 'No updatable fields provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Entry does not belong to user' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMetricLogDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.metricLogsService.update(id, dto, req.user.sub);
    return { message: 'METRIC_LOG_UPDATED', result, statusCode: HttpStatus.OK };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hard-delete a metric log entry' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Metric log deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Entry does not belong to user' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    await this.metricLogsService.remove(id, req.user.sub);
    return { message: 'METRIC_LOG_DELETED', result: null, statusCode: HttpStatus.OK };
  }
}
