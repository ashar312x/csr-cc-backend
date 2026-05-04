// ─── ICE / TURN ─────────────────────────────────────────────────────────────

export interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}

export interface IceConfiguration {
    iceServers: IceServer[];
    iceCandidatePoolSize?: number;
    iceTransportPolicy?: 'all' | 'relay';
    bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
    rtcpMuxPolicy?: 'negotiate' | 'require';
}

// ─── Online User ─────────────────────────────────────────────────────────────

export interface OnlineUser {
    userId: string;
    userName: string;
    socketId?: string;
    isOnline: boolean;
    lastSeen?: string;
}

// ─── Socket Event Payloads ───────────────────────────────────────────────────

export interface RegisterUserPayload {
    userId: string;
    userName: string;
}

export interface JoinCallSocketPayload {
    callUuid: string;
    participantUuid: string;
    userName: string;
    /** Set to false to skip SFU setup and use plain P2P signaling */
    sfuSupported?: boolean;
}

export interface SignalPayload {
    callUuid: string;
    targetParticipantUuid?: string;
    signal: any;
    type: string;
}

export interface CallInvitationPayload {
    targetUserId: string;
    callUuid: string;
    callType: string;
    callerId: string;
    callerName: string;
}

export interface AcceptCallPayload {
    callUuid: string;
    callerId: string;
}

export interface RejectCallPayload {
    callUuid: string;
    callerId: string;
}

export interface LeaveCallSocketPayload {
    callUuid?: string;
    reason?: string;
}

// ─── Health / Stats ──────────────────────────────────────────────────────────

export interface CallingStatsResponse {
    activeCalls: number;
    activeParticipants: number;
    onlineUsers: number;
    service: string;
    version: string;
    timestamp: string;
    turnServer: {
        configured: boolean;
        servers: string[];
        username: string;
    };
}
