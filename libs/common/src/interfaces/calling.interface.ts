export interface CallObject {
    id?: number;
    callUuid?: string;
    callType?: string;
    isGroup?: boolean;
    maxParticipants?: number;
    status?: string;
    participants?: ParticipantObject[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ParticipantObject {
    id?: number;
    callId?: number;
    participantUuid?: string;
    userName?: string;
    userId?: string;
    socketId?: string;
    joinedAt?: Date;
    leftAt?: Date;
}

export interface CreateCallInput {
    callType?: string;
    isGroup?: boolean;
    maxParticipants?: number;
}

export interface JoinCallInput {
    callUuid: string;
    userName: string;
    userId?: string;
}

export interface LeaveCallInput {
    callUuid: string;
    participantUuid: string;
}

export interface UpdateSocketInput {
    participantUuid: string;
    socketId: string;
}

export interface CallFilters {
    status?: string;
    callType?: string;
}
