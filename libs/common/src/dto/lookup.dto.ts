import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLookupDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_LOOKUP_NAME_REQUIRED' })
    name: string;

    @IsOptional()
    @Transform(({ value }) => value === null ? null : Number(value))
    @IsNumber()
    parent: number | null;
}
