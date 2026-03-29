import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { R2Service } from '../storage/r2.service';
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    deletePost(postId: string, ownerId: string, r2Service: R2Service): Promise<{
        message: string;
    }>;
    create(ownerId: string, dto: CreatePostDto): Promise<{
        pet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            imageUrl: string | null;
            breed: string | null;
        } | null;
        service: {
            id: string;
            name: string;
        };
    } & {
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
    }>;
    findMyPosts(ownerId: string): Promise<({
        applications: {
            id: string;
        }[];
        pet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            imageUrl: string | null;
            breed: string | null;
        } | null;
        service: {
            id: string;
            name: string;
        };
    } & {
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
    })[]>;
    findOne(id: string, userId?: string): Promise<{
        service: {
            id: string;
            name: string;
        };
        isSaved: boolean;
        isApplied: boolean;
        owner: {
            clientRating: number;
            reviewsCount: number;
            id: string;
            createdAt: Date;
            email: string;
            firstname: string;
            lastname: string;
            emailVerified: boolean;
            profileImageUrl: string | null;
        };
        savedBy: undefined;
        applications: undefined;
        pet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            imageUrl: string | null;
            breed: string | null;
        } | null;
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
    }>;
}
