import { BookingStatus } from '@prisma/client';
export declare class TodaysBookingDto {
    id: string;
    status: BookingStatus;
    ownerName: string;
    petName: string;
    ownerImageURL?: string;
    service: {
        id: string;
        name: string;
    };
    location: string;
    time: string;
}
export declare class ClientHistoryDto {
    id: string;
    ownerName: string;
    ownerImageUrl?: string;
    location: string;
    lastBookingDate: Date;
}
export declare class NearbyPostDto {
    id: string;
    title: string;
    location: string;
    service: {
        id: string;
        name: string;
    };
    duration: string;
    rating: number;
    reviewCount: number;
    imageUrl?: string;
    isSaved: boolean;
}
export declare class SitterHomeFeedDto {
    todaysBookings: TodaysBookingDto[];
    recentClients: ClientHistoryDto[];
    nearbyPosts: NearbyPostDto[] | null;
    unreadCount: number;
}
