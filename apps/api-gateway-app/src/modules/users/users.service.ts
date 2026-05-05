import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '@app/repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMe(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessForCC: user.accessForCC,
      accessForCSR: user.accessForCSR,
    };
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    await this.userRepository.update(userId, dto);
    return this.getMe(userId);
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('PASSWORD_MISMATCH');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException(
        'CHANGE_PASSWORD_INVALID_CURRENT_PASSWORD',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { passwordHash });
  }
}
