import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsString()
    @IsNotEmpty({ message: 'DTO_NOTIFICATION_TITLE_REQUIRED' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_NOTIFICATION_MESSAGE_REQUIRED' })
    message: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_NOTIFICATION_TYPE_REQUIRED' })
    type: string;

    @IsOptional()
    @IsString()
    userType?: string;

    @IsOptional()
    @IsNumber()
    bookingId?: number;

    @IsOptional()
    @IsString()
    operation?: string;

    @IsOptional()
    @IsNumber()
    vendorId?: number;
}

export class BulkCreateNotificationDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateNotificationDto)
    notifications: CreateNotificationDto[];
}

export class CreateBroadcastDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_BROADCAST_TITLE_REQUIRED' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_BROADCAST_MESSAGE_REQUIRED' })
    message: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_BROADCAST_TYPE_REQUIRED' })
    type: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    userIds?: number[];
}

export class ApproveBroadcastDto {
    @IsNumber()
    @IsNotEmpty({ message: 'DTO_NOTIFICATION_ID_REQUIRED' })
    notificationId: number;
}
