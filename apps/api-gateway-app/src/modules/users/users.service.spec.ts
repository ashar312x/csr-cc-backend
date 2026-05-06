import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { UserRepository } from '@app/repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserRole } from '@app/models/user.model';

jest.mock('bcryptjs');

const mockUserRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.USER,
  accessForCC: false,
  accessForCSR: false,
  passwordHash: '$2a$10$hashedpassword',
};

const mockUserProfile = {
  id: mockUser.id,
  name: mockUser.name,
  email: mockUser.email,
  role: mockUser.role,
  accessForCC: mockUser.accessForCC,
  accessForCSR: mockUser.accessForCSR,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getMe ───────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('returns the user profile when user exists', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getMe(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserProfile);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getMe(99)).rejects.toThrow(
        new NotFoundException('USER_NOT_FOUND'),
      );
    });

    it('returns only the allowed profile fields (no passwordHash)', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getMe(1);

      expect(result).not.toHaveProperty('passwordHash');
      expect(Object.keys(result)).toEqual([
        'id',
        'name',
        'email',
        'role',
        'accessForCC',
        'accessForCSR',
      ]);
    });
  });

  // ─── updateMe ────────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    const dto: UpdateUserDto = { name: 'Jane Doe', accessForCC: true };

    it('calls update then returns refreshed profile', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe', accessForCC: true };
      mockUserRepository.update.mockResolvedValue([1]);
      mockUserRepository.findById.mockResolvedValue(updatedUser);

      const result = await service.updateMe(1, dto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, dto);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result.name).toBe('Jane Doe');
      expect(result.accessForCC).toBe(true);
    });

    it('throws NotFoundException when user is not found after update', async () => {
      mockUserRepository.update.mockResolvedValue([1]);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.updateMe(99, dto)).rejects.toThrow(
        new NotFoundException('USER_NOT_FOUND'),
      );
    });

    it('passes the dto fields directly to the repository', async () => {
      mockUserRepository.update.mockResolvedValue([1]);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await service.updateMe(1, dto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, dto);
    });
  });

  // ─── updatePassword ───────────────────────────────────────────────────────────

  describe('updatePassword', () => {
    const validDto: UpdatePasswordDto = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass456',
      confirmPassword: 'newPass456',
    };

    it('updates the password hash when all inputs are valid', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newhashedpassword');
      mockUserRepository.update.mockResolvedValue([1]);

      await service.updatePassword(1, validDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        validDto.currentPassword,
        mockUser.passwordHash,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.newPassword, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        passwordHash: '$2a$10$newhashedpassword',
      });
    });

    it('throws BadRequestException when newPassword and confirmPassword do not match', async () => {
      const dto: UpdatePasswordDto = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass456',
        confirmPassword: 'differentPass',
      };

      await expect(service.updatePassword(1, dto)).rejects.toThrow(
        new BadRequestException('PASSWORD_MISMATCH'),
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.updatePassword(99, validDto)).rejects.toThrow(
        new NotFoundException('USER_NOT_FOUND'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword(1, validDto)).rejects.toThrow(
        new UnauthorizedException('CHANGE_PASSWORD_INVALID_CURRENT_PASSWORD'),
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('does not expose passwordHash in any return value', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newhashedpassword');
      mockUserRepository.update.mockResolvedValue([1]);

      const result = await service.updatePassword(1, validDto);

      expect(result).toBeUndefined();
    });

    it('checks mismatch before hitting the database', async () => {
      const dto: UpdatePasswordDto = {
        currentPassword: 'old',
        newPassword: 'aaa',
        confirmPassword: 'bbb',
      };

      await expect(service.updatePassword(1, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});
