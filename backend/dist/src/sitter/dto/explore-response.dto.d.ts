export declare class PostDto {
    id: string;
    ownerName: string;
    imageUrl?: string;
    title: string;
    location: string;
    service: {
        id: string;
        name: string;
    };
    duration: string;
    createdAt: Date;
    price?: number;
    rating: number;
    reviewCount: number;
}
export declare class ExploreResponseDto {
    posts: PostDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
