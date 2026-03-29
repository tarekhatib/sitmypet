import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
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
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
    markAsRead(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
