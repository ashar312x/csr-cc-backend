import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GatewayAuthGuard } from '../auth/guards/jwt-auth.guards';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(GatewayAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile returned',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@Req() req: Request & { user: { sub: number } }) {
    const result = await this.usersService.getMe(req.user.sub);
    return { message: 'GET_ME_SUCCESS', result, statusCode: HttpStatus.OK };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user name or access flags' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(
    @Req() req: Request & { user: { sub: number } },
    @Body() dto: UpdateUserDto,
  ) {
    const result = await this.usersService.updateMe(req.user.sub, dto);
    return { message: 'UPDATE_ME_SUCCESS', result, statusCode: HttpStatus.OK };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Update password for the current user' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or passwords do not match',
  })
  @ApiResponse({
    status: 401,
    description: 'Wrong current password or unauthorized',
  })
  async updatePassword(
    @Req() req: Request & { user: { sub: number } },
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(req.user.sub, dto);
    return {
      message: 'UPDATE_PASSWORD_SUCCESS',
      result: null,
      statusCode: HttpStatus.OK,
    };
  }
}
