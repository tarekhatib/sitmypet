import { BookingStatus } from '@prisma/client';
export declare class TodaysBookingDto {
    id: string;
    status: BookingStatus;
    sitterName: string;
    sitterImageURL?: string;
    petName: string;
    service: {
        id: string;
        name: string;
    };
    location: string;
    time: string;
}
export declare class SitterHistoryDto {
    id: string;
    sitterName: string;
    sitterImageUrl?: string;
    location: string;
    lastBookingDate: Date;
}
export declare class NearbySittersDto {
    id: string;
    sitterName: string;
    sitterImageUrl?: string;
    location: string | null;
    rating: number;
    reviewCount: number;
    isSaved: boolean;
}
export declare class OwnerHomeFeedDto {
    todaysBookings: TodaysBookingDto[];
    recentSitters: SitterHistoryDto[];
    nearbySitters: NearbySittersDto[] | null;
    unreadCount: number;
}
