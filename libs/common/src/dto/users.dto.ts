import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_FIRST_NAME_REQUIRED' })
    declare firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_LAST_NAME_REQUIRED' })
    declare  lastName: string;

    @IsEmail({}, { message: 'DTO_INVALID_EMAIL' })
    @IsNotEmpty({ message: 'DTO_EMAIL_REQUIRED' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_PASSWORD_REQUIRED' })
    @MinLength(6, { message: 'DTO_PASSWORD_MIN_LENGTH' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_PHONE_NUMBER_REQUIRED' })
    phNumber: string;

    @IsOptional()
    @IsEnum(['admin', 'customer'], { message: 'DTO_INVALID_USER_TYPE' })
    userType?: string;

    @IsOptional()
    @IsString()
    fcmToken?: string;
}

export class LoginUserDto {
    @IsEmail({}, { message: 'DTO_INVALID_EMAIL' })
    @IsNotEmpty({ message: 'DTO_EMAIL_REQUIRED' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_PASSWORD_REQUIRED' })
    @MinLength(6, { message: 'DTO_PASSWORD_MIN_LENGTH' })
    password: string;
}

export class AdminCreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_FIRST_NAME_REQUIRED' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_LAST_NAME_REQUIRED' })
    lastName: string;

    @IsEmail({}, { message: 'DTO_INVALID_EMAIL' })
    @IsNotEmpty({ message: 'DTO_EMAIL_REQUIRED' })
    email: string;

    @IsNotEmpty({ message: 'DTO_ROLE_ID_REQUIRED' })
    roleId: number;

    @IsOptional()
    @IsString()
    phNumber?: string;
}

export class AdminUpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'DTO_INVALID_EMAIL' })
    email?: string;

    @IsOptional()
    roleId?: number;

    @IsOptional()
    @IsEnum(['admin', 'onboarder', 'employeer', 'employee', 'customer'], { message: 'DTO_INVALID_USER_TYPE' })
    userType?: string;

    @IsOptional()
    @IsString()
    phNumber?: string;

    @IsOptional()
    isActive?: boolean;
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_CURRENT_PASSWORD_REQUIRED' })
    @MinLength(6, { message: 'DTO_PASSWORD_MIN_LENGTH' })
    currentPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_NEW_PASSWORD_REQUIRED' })
    @MinLength(6, { message: 'DTO_PASSWORD_MIN_LENGTH' })
    newPassword: string;
}
