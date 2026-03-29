import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cleanupOldNotifications(): Promise<void>;
    createNotification(userId: string, type: NotificationType, title: string, message: string, metadata?: {
        postId?: string;
        applicationId?: string;
        bookingId?: string;
        senderId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string | null;
        userId: string;
        title: string;
        postId: string | null;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        applicationId: string | null;
        bookingId: string | null;
    }>;
    getUserNotifications(userId: string): Promise<{
        notifications: ({
            sender: {
                id: string;
                firstname: string;
                lastname: string;
                profileImageUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            senderId: string | null;
            userId: string;
            title: string;
            postId: string | null;
            type: import("@prisma/client").$Enums.NotificationType;
            message: string;
            isRead: boolean;
            readAt: Date | null;
            applicationId: string | null;
            bookingId: string | null;
        })[];
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string | null;
        userId: string;
        title: string;
        postId: string | null;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        applicationId: string | null;
        bookingId: string | null;
    }>;
}
