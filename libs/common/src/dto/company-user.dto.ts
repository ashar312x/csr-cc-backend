import { IsNumber, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateCompanyUserDto {
    @IsNumber()
    @IsNotEmpty({ message: 'DTO_COMPANY_ID_REQUIRED' })
    companyId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'DTO_USER_ID_REQUIRED' })
    userId: number;

    @IsOptional()
    @IsBoolean()
    isInitialAdmin?: boolean;

    @IsOptional()
    @IsDateString()
    joinedAt?: Date;
}

export class RemoveCompanyUserDto {
    @IsNumber()
    @IsNotEmpty({ message: 'DTO_COMPANY_ID_REQUIRED' })
    companyId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'DTO_USER_ID_REQUIRED' })
    userId: number;
}
