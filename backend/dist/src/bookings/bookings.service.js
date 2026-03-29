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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const bookings = await this.prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        profileImageUrl: true,
                    },
                },
                sitter: {
                    select: {
                        id: true,
                        firstname: true,
                        profileImageUrl: true,
                    },
                },
                pet: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return bookings.map((booking) => ({
            id: booking.id,
            ownerName: booking.owner.firstname,
            petName: booking.pet.name,
            ownerImageURL: booking.owner.profileImageUrl,
            sitterName: booking.sitter.firstname,
            sitterImageURL: booking.sitter.profileImageUrl,
            service: {
                id: booking.service.id,
                name: booking.service.name,
            },
            location: booking.location,
            time: booking.scheduledTime,
            isOwner: userId ? booking.ownerId === userId : false,
            isSitter: userId ? booking.sitterId === userId : false,
        }));
    }
    async findOne(id, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                        profileImageUrl: true,
                    },
                },
                sitter: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                        profileImageUrl: true,
                    },
                },
                pet: true,
                review: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        return {
            ...booking,
            isOwner: userId ? booking.ownerId === userId : false,
            isSitter: userId ? booking.sitterId === userId : false,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map