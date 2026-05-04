export interface NotificationObject {
    id?: number;
    title?: string;
    message?: string;
    description?: string;
    image?: string;
    type?: string;
    userType?: string;
    bookingId?: number;
    operation?: string;
    vendorId?: number;
    numberOfUsers?: number;
    createdBy?: number;
    channel?: string;
    isSent?: boolean;
    isRead?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateNotification {
    userId?: number;
    title: string;
    message: string;
    image?: string;
    type: string;
    userType?: string;
    bookingId?: number;
    operation?: string;
    vendorId?: number;
}

export interface CreateBroadcast {
    title: string;
    message: string;
    image?: string;
    type: string;
    userIds?: number[];
}

export interface ApproveBroadcast {
    notificationId: number;
}

export interface NotificationId {
    notificationId: number;
    userId: number;
}

export interface NotificationFilters {
    type?: string | string[];
    userType?: string | string[];
    search?: string;
    isRead?: boolean;
    bookingId?: number;
    vendorId?: number;
    status?: string | string[];
    isApproved?: boolean;
    operation?: string | string[];
    dateFrom?: Date | string;
    dateTo?: Date | string;
}

export interface UserMapNotificationObject {
    id?: number;
    userId?: number;
    notificationId?: number;
    isRead?: boolean;
    isSent?: boolean;
    isDelivered?: boolean;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    notification?: NotificationObject;
}
