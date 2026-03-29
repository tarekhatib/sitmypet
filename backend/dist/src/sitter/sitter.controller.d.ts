import { Role } from '@prisma/client';
import { ExploreQueryDto } from './dto/explore-query.dto';
import { SitterService } from './sitter.service';
export declare class SitterController {
    private readonly sitterService;
    constructor(sitterService: SitterService);
    getHome(req: {
        user: {
            sub: string;
            roles: Role[];
        };
    }): Promise<import("./dto/sitter-home.dto").SitterHomeFeedDto>;
    explore(query: ExploreQueryDto, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./dto/explore-response.dto").ExploreResponseDto>;
    toggleSavePost(postId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        saved: boolean;
    }>;
    getSavedPosts(req: {
        user: {
            sub: string;
        };
    }): Promise<{
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
