import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class UsersService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createUser(data: {
        firstname: string;
        lastname: string;
        email: string;
        passwordHash: string;
        roles?: Role[];
        profileImageUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    } | null>;
    findByEmailWithPassword(email: string): Promise<{
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
    } | null>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    } | null>;
    addRole(userId: string, role: Role): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    updateProfile(userId: string, data: {
        firstname?: string;
        lastname?: string;
        email?: string;
        password?: string;
        location?: string;
        profileImageUrl?: string;
    }): Promise<{
        location: {
            id: string;
            name: string;
        } | null;
        document: {
            id: string;
            status: string;
            fileKey: string | null;
            fileUrl: string;
        } | null;
        id: string;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
        profile: {
            location: {
                id: string;
                name: string;
            } | null;
            document: {
                id: string;
                status: string;
                fileKey: string | null;
                fileUrl: string;
            } | null;
        } | null;
    }>;
    removeRole(userId: string, role: Role): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    getMe(userId: string): Promise<{
        location: {
            id: string;
            name: string;
        } | null;
        document: {
            id: string;
            status: string;
            fileKey: string | null;
            fileUrl: string;
        } | null;
        id: string;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
        profile: {
            location: {
                id: string;
                name: string;
            } | null;
            document: {
                id: string;
                status: string;
                fileKey: string | null;
                fileUrl: string;
            } | null;
        } | null;
    }>;
    updateRefreshToken(userId: string, refreshTokenHash: string, refreshTokenJti: string, refreshTokenExp: Date): Promise<{
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
    }>;
    clearRefreshToken(userId: string): Promise<{
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
    }>;
    findByIdWithRefreshToken(userId: string): Promise<{
        id: string;
        roles: import("@prisma/client").$Enums.Role[];
        refreshTokenExp: Date | null;
        refreshTokenHash: string | null;
        refreshTokenJti: string | null;
    } | null>;
    saveEmailOtp(userId: string, otpHash: string, expiresAt: Date): Promise<{
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
    }>;
    incrementOtpAttempts(userId: string): Promise<{
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
    }>;
    verifyEmail(userId: string): Promise<{
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
    }>;
    findByEmailWithOtp(email: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean;
        emailOtpAttempts: number;
        emailOtpExpires: Date | null;
        emailOtpHash: string | null;
    } | null>;
    savePasswordResetOtp(userId: string, otpHash: string, expiresAt: Date): Promise<{
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
    }>;
    findByEmailWithPasswordResetOtp(email: string): Promise<{
        id: string;
        email: string;
        passwordResetOtpAttempts: number;
        passwordResetOtpExpires: Date | null;
        passwordResetOtpHash: string | null;
    } | null>;
    incrementPasswordResetOtpAttempts(userId: string): Promise<{
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
    }>;
    resetPassword(userId: string, newPasswordHash: string): Promise<{
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
    }>;
    updateProfileImage(userId: string, imageUrl: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    deleteAccount(userId: string, passwordVerification: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    updateIdDocument(userId: string, documentUrl: string, documentKey?: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        profileId: string;
        fileKey: string | null;
        fileUrl: string;
    }>;
    getUserProfile(userId: string, requesterId?: string): Promise<{
        contactInfo: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            profileImageUrl: string | null;
            location: string | null;
        };
        sitterInfo: {
            clientsWorkedWith: number;
            reviewsCount: number;
            averageRating: number;
        };
        ownerInfo: {
            sittersWorkedWith: number;
            jobsPosted: number;
            reviewsCount: number;
            averageRating: number;
        };
        pets: {
            id: string;
            name: string;
            imageUrl: string | null;
            breed: string | null;
        }[];
        posts: {
            id: string;
            location: string;
            scheduledTime: Date;
            status: import("@prisma/client").$Enums.PostStatus;
            pet: {
                id: string;
                name: string;
                imageUrl: string | null;
            } | null;
            service: {
                name: string;
            };
            title: string;
            duration: string;
            imageUrl: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            description: string;
        }[];
        previousRating: number | null;
        reviewsCount: number;
        averageRating: number;
    }>;
    reviewUser(reviewerId: string, targetUserId: string, rating: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bookingId: string;
        rating: number;
        comment: string | null;
    }>;
}
