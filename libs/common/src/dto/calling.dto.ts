import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateCallDto {
    @IsOptional()
    @IsEnum(['audio', 'video', 'screen'], { message: 'DTO_INVALID_CALL_TYPE' })
    callType?: string;

    @IsOptional()
    @IsBoolean()
    isGroup?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(50)
    maxParticipants?: number;
}

export class JoinCallDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_CALL_UUID_REQUIRED' })
    callUuid: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_USERNAME_REQUIRED' })
    userName: string;

    @IsOptional()
    @IsString()
    userId?: string;
}

export class LeaveCallDto {
    @IsString()
    @IsNotEmpty({ message: 'DTO_CALL_UUID_REQUIRED' })
    callUuid: string;

    @IsString()
    @IsNotEmpty({ message: 'DTO_PARTICIPANT_UUID_REQUIRED' })
    participantUuid: string;
}
