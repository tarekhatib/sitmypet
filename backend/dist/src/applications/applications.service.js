"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async apply(postId, sitterId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const existing = await this.prisma.application.findFirst({
            where: {
                postId,
                sitterId,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already applied to this job');
        }
        const application = await this.prisma.application.create({
            data: {
                postId,
                sitterId,
                status: 'PENDING',
                updatedAt: new Date(),
            },
            include: {
                post: true,
                sitter: true,
            },
        });
        await this.notificationsService.createNotification(post.ownerId, 'NEW_APPLICATION', 'New Application', `${application.sitter.firstname} applied to your post titled "${post.title}"`, { applicationId: application.id, postId: post.id, senderId: sitterId });
        return application;
    }
    async withdraw(postId, sitterId) {
        const application = await this.prisma.application.findFirst({
            where: {
                postId,
                sitterId,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        await this.prisma.application.delete({
            where: { id: application.id },
        });
        return { success: true };
    }
    async getApplicationsByPostId(postId, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.ownerId !== userId) {
            throw new common_1.BadRequestException('You do not have permission to view these applications');
        }
        return this.prisma.application.findMany({
            where: {
                postId,
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                sitter: {
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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async acceptApplication(applicationId, ownerId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                post: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.post.ownerId !== ownerId) {
            throw new common_1.BadRequestException('You do not have permission to accept this application');
        }
        if (application.post.scheduledTime < new Date()) {
            throw new common_1.BadRequestException('Cannot accept application: this post has already expired');
        }
        if (!application.post.petId) {
            throw new common_1.BadRequestException('Cannot accept application: Post is missing an associated pet ID');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    sitterId: application.sitterId,
                    ownerId: application.post.ownerId,
                    petId: application.post.petId,
                    serviceId: application.post.serviceId,
                    location: application.post.location,
                    scheduledTime: application.post.scheduledTime,
                    status: 'CONFIRMED',
                },
            });
            await tx.post.update({
                where: { id: application.postId },
                data: { status: 'CLOSED' },
            });
            await tx.application.deleteMany({
                where: { postId: application.postId },
            });
            return booking;
        });
        const owner = await this.prisma.user.findUnique({
            where: { id: ownerId },
        });
        await this.notificationsService.createNotification(application.sitterId, 'APPLICATION_ACCEPTED', 'Application Accepted', `${owner?.firstname} accepted your application for the post "${application.post.title}"`, { bookingId: result.id, senderId: ownerId });
        return result;
    }
    async getOwnerRequests(ownerId) {
        return this.prisma.application.findMany({
            where: {
                post: {
                    ownerId,
                    status: 'OPEN',
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                post: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        duration: true,
                        service: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                sitter: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async rejectApplication(applicationId, ownerId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                post: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.post.ownerId !== ownerId) {
            throw new common_1.BadRequestException('You do not have permission to reject this application');
        }
        await this.prisma.application.delete({
            where: { id: applicationId },
        });
        const owner = await this.prisma.user.findUnique({
            where: { id: ownerId },
        });
        await this.notificationsService.createNotification(application.sitterId, 'APPLICATION_REJECTED', 'Application Rejected', `${owner?.firstname} rejected your application for the post "${application.post.title}"`, { postId: application.postId, senderId: ownerId });
        return { success: true };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map