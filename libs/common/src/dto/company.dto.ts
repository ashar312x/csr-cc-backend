import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_COMPANY_NAME_REQUIRED' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_DESCRIPTION_REQUIRED' })
    description: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    logo?: string;
}

export class UpdateCompanyDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    logo?: string;
}
