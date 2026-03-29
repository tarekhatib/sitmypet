"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const userSelect = {
    id: true,
    firstname: true,
    lastname: true,
    email: true,
    roles: true,
    createdAt: true,
    profileImageUrl: true,
};
let UsersService = class UsersService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createUser(data) {
        const exists = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (exists) {
            throw new common_1.ConflictException('Email already in use');
        }
        return this.prisma.user.create({
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                passwordHash: data.passwordHash,
                roles: data.roles ?? [client_1.Role.OWNER, client_1.Role.SITTER],
                ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
            },
            select: userSelect,
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });
    }
    async findByEmailWithPassword(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
    }
    async addRole(userId, role) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.roles.includes(role)) {
            return user;
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: [...user.roles, role],
            },
            select: userSelect,
        });
    }
    async updateProfile(userId, data) {
        const { firstname, lastname, email, location, password: __ } = data;
        void __;
        const updateData = {};
        if (firstname)
            updateData.firstname = firstname;
        if (lastname)
            updateData.lastname = lastname;
        if (email) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const emailExists = await this.prisma.user.findUnique({
                where: { email },
            });
            if (emailExists && emailExists.id !== userId) {
                throw new common_1.ConflictException('Email already in use');
            }
            updateData.email = email;
            updateData.emailVerified = false;
        }
        if (location !== undefined) {
            const loc = await this.prisma.location.findUnique({
                where: { name: location },
            });
            if (!loc) {
                throw new common_1.NotFoundException(`Location '${location}' not found`);
            }
            await this.prisma.profile.upsert({
                where: { userId },
                update: {
                    locationId: loc.id,
                },
                create: {
                    userId: userId,
                    locationId: loc.id,
                },
            });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return this.getMe(userId);
    }
    async removeRole(userId, role) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: user.roles.filter((r) => r !== role),
            },
            select: userSelect,
        });
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                roles: true,
                profileImageUrl: true,
                profile: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        document: {
                            select: {
                                id: true,
                                status: true,
                                fileUrl: true,
                                fileKey: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            ...user,
            location: user.profile?.location ?? null,
            document: user.profile?.document ?? null,
        };
    }
    async updateRefreshToken(userId, refreshTokenHash, refreshTokenJti, refreshTokenExp) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash,
                refreshTokenJti,
                refreshTokenExp,
            },
        });
    }
    async clearRefreshToken(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash: null,
                refreshTokenJti: null,
                refreshTokenExp: null,
            },
        });
    }
    async findByIdWithRefreshToken(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                roles: true,
                refreshTokenHash: true,
                refreshTokenJti: true,
                refreshTokenExp: true,
            },
        });
    }
    async saveEmailOtp(userId, otpHash, expiresAt) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                emailOtpHash: otpHash,
                emailOtpExpires: expiresAt,
                emailOtpAttempts: 0,
            },
        });
    }
    async incrementOtpAttempts(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                emailOtpAttempts: {
                    increment: 1,
                },
            },
        });
    }
    async verifyEmail(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: true,
                emailOtpHash: null,
                emailOtpExpires: null,
                emailOtpAttempts: 0,
            },
        });
    }
    async findByEmailWithOtp(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                emailOtpHash: true,
                emailOtpExpires: true,
                emailOtpAttempts: true,
            },
        });
    }
    async savePasswordResetOtp(userId, otpHash, expiresAt) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordResetOtpHash: otpHash,
                passwordResetOtpExpires: expiresAt,
                passwordResetOtpAttempts: 0,
            },
        });
    }
    async findByEmailWithPasswordResetOtp(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordResetOtpHash: true,
                passwordResetOtpExpires: true,
                passwordResetOtpAttempts: true,
            },
        });
    }
    async incrementPasswordResetOtpAttempts(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordResetOtpAttempts: {
                    increment: 1,
                },
            },
        });
    }
    async resetPassword(userId, newPasswordHash) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                emailVerified: true,
                passwordResetOtpHash: null,
                passwordResetOtpExpires: null,
                passwordResetOtpAttempts: 0,
                refreshTokenHash: null,
                refreshTokenJti: null,
                refreshTokenExp: null,
            },
        });
    }
    async updateProfileImage(userId, imageUrl) {
        const profile = await this.prisma.profile.upsert({
            where: { userId },
            create: {
                user: { connect: { id: userId } },
            },
            update: {},
        });
        await this.prisma.profilePicture.upsert({
            where: { profileId: profile.id },
            update: { url: imageUrl },
            create: {
                profileId: profile.id,
                url: imageUrl,
            },
        });
        return this.prisma.user.update({
            where: { id: userId },
            data: { profileImageUrl: imageUrl },
            select: userSelect,
        });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.ConflictException('Invalid old password');
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
            select: userSelect,
        });
    }
    async deleteAccount(userId, passwordVerification) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(passwordVerification, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.ConflictException('Invalid password');
        }
        return this.prisma.user.delete({
            where: { id: userId },
            select: userSelect,
        });
    }
    async updateIdDocument(userId, documentUrl, documentKey) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found. Please create a profile first.');
        }
        return this.prisma.document.upsert({
            where: { profileId: profile.id },
            update: {
                fileUrl: documentUrl,
                fileKey: documentKey,
            },
            create: {
                profileId: profile.id,
                fileUrl: documentUrl,
                fileKey: documentKey,
                status: 'UNVERIFIED',
            },
        });
    }
    async getUserProfile(userId, requesterId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                profileImageUrl: true,
                profile: {
                    select: {
                        location: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                ownedPets: {
                    select: {
                        id: true,
                        name: true,
                        breed: true,
                        imageUrl: true,
                    },
                },
                postsAsOwner: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        location: true,
                        scheduledTime: true,
                        duration: true,
                        imageUrl: true,
                        status: true,
                        pet: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                        service: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const sitterBookings = await this.prisma.booking.findMany({
            where: {
                sitterId: userId,
                status: 'COMPLETED',
                scheduledTime: {
                    lt: new Date(),
                },
            },
            select: {
                ownerId: true,
                review: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        const uniqueClients = new Set(sitterBookings.map((b) => b.ownerId)).size;
        const reviews = sitterBookings.filter((b) => b.review);
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((acc, curr) => acc + curr.review.rating, 0) /
                totalReviews
            : 0;
        const ownerBookings = await this.prisma.booking.findMany({
            where: {
                ownerId: userId,
                status: 'COMPLETED',
                scheduledTime: {
                    lt: new Date(),
                },
            },
            select: {
                sitterId: true,
                review: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        const uniqueSittersBooked = new Set(ownerBookings.map((b) => b.sitterId))
            .size;
        const ownerReviews = ownerBookings.filter((b) => b.review);
        const ownerTotalReviews = ownerReviews.length;
        const ownerAverageRating = ownerTotalReviews > 0
            ? ownerReviews.reduce((acc, curr) => acc + curr.review.rating, 0) /
                ownerTotalReviews
            : 0;
        const jobsPosted = await this.prisma.post.count({
            where: {
                ownerId: userId,
            },
        });
        const totalReviewsCombined = totalReviews + ownerTotalReviews;
        const combinedAverageRating = totalReviewsCombined > 0
            ? (reviews.reduce((acc, curr) => acc + curr.review.rating, 0) +
                ownerReviews.reduce((acc, curr) => acc + curr.review.rating, 0)) /
                totalReviewsCombined
            : 0;
        let previousRating = null;
        if (requesterId && requesterId !== userId) {
            const previousBookingReview = await this.prisma.booking.findFirst({
                where: {
                    OR: [
                        { ownerId: requesterId, sitterId: userId },
                        { ownerId: userId, sitterId: requesterId },
                    ],
                    review: { isNot: null },
                },
                orderBy: { scheduledTime: 'desc' },
                select: {
                    review: {
                        select: {
                            rating: true,
                        },
                    },
                },
            });
            if (previousBookingReview?.review) {
                previousRating = previousBookingReview.review.rating;
            }
        }
        return {
            contactInfo: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                location: user.profile?.location?.name || null,
            },
            sitterInfo: {
                clientsWorkedWith: uniqueClients,
                reviewsCount: totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
            },
            ownerInfo: {
                sittersWorkedWith: uniqueSittersBooked,
                jobsPosted: jobsPosted,
                reviewsCount: ownerTotalReviews,
                averageRating: Number(ownerAverageRating.toFixed(1)),
            },
            pets: user.ownedPets,
            posts: user.postsAsOwner,
            previousRating,
            reviewsCount: totalReviewsCombined,
            averageRating: Number(combinedAverageRating.toFixed(1)),
        };
    }
    async reviewUser(reviewerId, targetUserId, rating) {
        if (reviewerId === targetUserId) {
            throw new common_1.ConflictException('You cannot review yourself');
        }
        const booking = await this.prisma.booking.findFirst({
            where: {
                OR: [
                    { ownerId: reviewerId, sitterId: targetUserId },
                    { ownerId: targetUserId, sitterId: reviewerId },
                ],
                status: 'COMPLETED',
                scheduledTime: {
                    lt: new Date(),
                },
            },
            orderBy: {
                scheduledTime: 'desc',
            },
            include: {
                review: true,
            },
        });
        if (!booking) {
            throw new common_1.BadRequestException('You can only review users you have worked with in a completed job.');
        }
        const review = await this.prisma.review.upsert({
            where: {
                bookingId: booking.id,
            },
            update: {
                rating,
            },
            create: {
                bookingId: booking.id,
                rating,
            },
        });
        const reviewer = await this.prisma.user.findUnique({
            where: { id: reviewerId },
        });
        await this.notificationsService.createNotification(targetUserId, 'NEW_REVIEW', 'New Review Received', `${reviewer?.firstname} left you a ${rating}-star review for your recent booking.`, { bookingId: booking.id, senderId: reviewerId });
        return review;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], UsersService);
//# sourceMappingURL=users.service.js.map