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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PostsService = class PostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async deletePost(postId, ownerId, r2Service) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${postId} not found`);
        }
        if (post.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
        if (post.imageUrl) {
            const key = r2Service.extractKeyFromUrl(post.imageUrl);
            if (key) {
                await r2Service.delete(key);
            }
        }
        await this.prisma.post.delete({ where: { id: postId } });
        return { message: 'Post deleted successfully' };
    }
    async create(ownerId, dto) {
        const service = await this.prisma.service.findFirst({
            where: { name: { equals: dto.serviceName, mode: 'insensitive' } },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service "${dto.serviceName}" not found`);
        }
        if (dto.petId) {
            const pet = await this.prisma.pet.findFirst({
                where: { id: dto.petId, ownerId },
            });
            if (!pet) {
                throw new common_1.NotFoundException('Pet not found or does not belong to you');
            }
        }
        return this.prisma.post.create({
            data: {
                ownerId,
                serviceId: service.id,
                title: dto.title,
                description: dto.description,
                petId: dto.petId,
                scheduledTime: new Date(dto.scheduledTime),
                duration: dto.duration,
                price: dto.price,
                location: dto.location,
                imageUrl: dto.imageUrl,
            },
            include: {
                service: { select: { id: true, name: true } },
                pet: true,
            },
        });
    }
    async findMyPosts(ownerId) {
        return this.prisma.post.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
            include: {
                service: { select: { id: true, name: true } },
                pet: true,
                applications: {
                    select: { id: true },
                },
            },
        });
    }
    async findOne(id, userId) {
        const job = await this.prisma.post.findUnique({
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
                        emailVerified: true,
                        createdAt: true,
                        bookingsAsOwner: {
                            select: {
                                review: {
                                    select: {
                                        rating: true,
                                    },
                                },
                            },
                        },
                    },
                },
                pet: true,
                savedBy: userId
                    ? {
                        where: {
                            userId: userId,
                        },
                    }
                    : undefined,
                applications: userId
                    ? {
                        where: { sitterId: userId },
                        select: { id: true },
                    }
                    : undefined,
            },
        });
        if (!job) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found`);
        }
        const reviews = job.owner.bookingsAsOwner
            .map((b) => b.review)
            .filter((r) => r !== null);
        const clientRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        const { bookingsAsOwner: __, ...ownerData } = job.owner;
        void __;
        const isApplied = userId
            ? job.applications
                ? job.applications.length > 0
                : false
            : false;
        return {
            ...job,
            service: {
                id: job.service.id,
                name: job.service.name,
            },
            isSaved: job.savedBy ? job.savedBy.length > 0 : false,
            isApplied,
            owner: {
                ...ownerData,
                clientRating,
                reviewsCount: reviews.length,
            },
            savedBy: undefined,
            applications: undefined,
        };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map