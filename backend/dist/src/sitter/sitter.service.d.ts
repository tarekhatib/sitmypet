import { PrismaService } from '../prisma/prisma.service';
import { ExploreQueryDto } from './dto/explore-query.dto';
import { ExploreResponseDto } from './dto/explore-response.dto';
import { SitterHomeFeedDto } from './dto/sitter-home.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SitterService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getHomeFeed(userId: string): Promise<SitterHomeFeedDto>;
    explore(query: ExploreQueryDto, userId: string): Promise<ExploreResponseDto>;
    toggleSavedPost(userId: string, postId: string): Promise<{
        saved: boolean;
    }>;
    getSavedPosts(userId: string): Promise<{
        posts: {
            id: string;
            title: string;
            location: string;
            service: {
                id: string;
                name: string;
            };
            duration: string;
            imageUrl: string | undefined;
            ownerName: string;
            price: number | undefined;
            rating: number;
            reviewCount: number;
            isSaved: boolean;
            createdAt: Date;
        }[];
    }>;
}
