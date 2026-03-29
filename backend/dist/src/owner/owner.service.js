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
exports.OwnerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let OwnerService = class OwnerService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getHomeFeed(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const bookings = await this.prisma.booking.findMany({
            where: {
                ownerId: userId,
                scheduledTime: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                sitter: true,
                pet: true,
                service: true,
            },
            orderBy: {
                scheduledTime: 'asc',
            },
        });
        const todaysBookings = bookings.map((booking) => ({
            id: booking.id,
            sitterName: `${booking.sitter.firstname} ${booking.sitter.lastname}`,
            sitterImageURL: booking.sitter.profileImageUrl ?? undefined,
            petName: booking.pet.name,
            service: {
                id: booking.service.id,
                name: booking.service.name,
            },
            status: booking.status,
            location: booking.location,
            time: booking.scheduledTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        }));
        const completedBookings = await this.prisma.booking.findMany({
            where: {
                ownerId: userId,
                status: 'COMPLETED',
            },
            include: {
                sitter: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        const uniqueSitters = new Map();
        for (const booking of completedBookings) {
            if (!uniqueSitters.has(booking.sitterId) && uniqueSitters.size < 10) {
                uniqueSitters.set(booking.sitterId, {
                    id: booking.sitter.id,
                    sitterName: `${booking.sitter.firstname} ${booking.sitter.lastname}`,
                    sitterImageUrl: booking.sitter.profileImageUrl ?? undefined,
                    location: booking.location,
                    lastBookingDate: booking.scheduledTime,
                });
            }
        }
        const recentSitters = Array.from(uniqueSitters.values());
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { location: true },
        });
        const locationName = profile?.location?.name;
        let nearbySitters = null;
        if (locationName) {
            const sitters = await this.prisma.user.findMany({
                where: {
                    id: { not: userId },
                    roles: { has: 'SITTER' },
                    profile: {
                        location: {
                            name: {
                                contains: locationName,
                                mode: 'insensitive',
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    profileImageUrl: true,
                    profile: {
                        select: {
                            location: { select: { name: true } },
                            savedBy: {
                                where: { userId },
                                select: { id: true },
                            },
                        },
                    },
                    bookingsAsSitter: {
                        where: { status: 'COMPLETED' },
                        select: {
                            review: { select: { rating: true } },
                        },
                    },
                },
                take: 10,
            });
            nearbySitters = sitters.map((sitter) => {
                const reviews = sitter.bookingsAsSitter
                    .map((b) => b.review)
                    .filter((r) => r !== null);
                const reviewCount = reviews.length;
                const rating = reviewCount > 0
                    ? reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) /
                        reviewCount
                    : 0;
                return {
                    id: sitter.id,
                    sitterName: `${sitter.firstname} ${sitter.lastname}`,
                    sitterImageUrl: sitter.profileImageUrl ?? undefined,
                    location: sitter.profile?.location?.name ?? null,
                    rating: Number(rating.toFixed(1)),
                    reviewCount,
                    isSaved: (sitter.profile?.savedBy?.length ?? 0) > 0,
                };
            });
        }
        const unreadCount = await this.notificationsService.getUnreadCount(userId);
        return {
            todaysBookings,
            recentSitters,
            nearbySitters,
            unreadCount,
        };
    }
    async getPets(ownerId) {
        return this.prisma.pet.findMany({
            where: { ownerId },
            select: {
                id: true,
                name: true,
                breed: true,
                imageUrl: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createPet(ownerId, dto) {
        return this.prisma.pet.create({
            data: {
                ownerId,
                name: dto.name,
                breed: dto.breed,
                imageUrl: dto.imageUrl,
            },
        });
    }
    async deletePet(ownerId, petId, r2Service) {
        const pet = await this.prisma.pet.findUnique({
            where: { id: petId },
        });
        if (!pet) {
            throw new common_1.NotFoundException(`Pet with ID ${petId} not found`);
        }
        if (pet.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only delete your own pets');
        }
        if (pet.imageUrl) {
            const key = r2Service.extractKeyFromUrl(pet.imageUrl);
            if (key) {
                await r2Service.delete(key);
            }
        }
        await this.prisma.pet.delete({ where: { id: petId } });
        return { message: 'Pet deleted successfully' };
    }
    async uploadPetImage(ownerId, file, r2Service) {
        const uploaded = await r2Service.upload(file.buffer, file.originalname, file.mimetype, 'uploads/pet_pfps');
        return { imageUrl: uploaded.url };
    }
};
exports.OwnerService = OwnerService;
exports.OwnerService = OwnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OwnerService);
//# sourceMappingURL=owner.service.js.map