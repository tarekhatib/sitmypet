import { ApplicationsService } from './applications.service';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    apply(postId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        sitter: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            roles: import("@prisma/client").$Enums.Role[];
            firstname: string;
            lastname: string;
            refreshTokenExp: Date | null;
            refreshTokenHash: string | null;
            refreshTokenJti: string | null;
            emailVerified: boolean;
            emailOtpAttempts: number;
            emailOtpExpires: Date | null;
            emailOtpHash: string | null;
            passwordResetOtpAttempts: number;
            passwordResetOtpExpires: Date | null;
            passwordResetOtpHash: string | null;
            profileImageUrl: string | null;
        };
        post: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            ownerId: string;
            petId: string;
            scheduledTime: Date;
            status: import("@prisma/client").$Enums.PostStatus;
            serviceId: string;
            title: string;
            duration: string;
            imageUrl: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            description: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sitterId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        postId: string;
    }>;
    withdraw(postId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        success: boolean;
    }>;
    getApplicationsByPostId(postId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        sitter: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            profileImageUrl: string | null;
            profile: {
                location: {
                    name: string;
                } | null;
            } | null;
        };
    }[]>;
    acceptApplication(applicationId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        sitterId: string;
        ownerId: string;
        petId: string;
        scheduledTime: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        serviceId: string;
    }>;
    rejectApplication(applicationId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        success: boolean;
    }>;
}
