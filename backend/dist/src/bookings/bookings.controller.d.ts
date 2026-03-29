import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    getAllBookings(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        ownerName: string;
        petName: string;
        ownerImageURL: string | null;
        sitterName: string;
        sitterImageURL: string | null;
        service: {
            id: string;
            name: string;
        };
        location: string;
        time: Date;
        isOwner: boolean;
        isSitter: boolean;
    }[]>;
    getOne(id: string, req: Request & {
        user: {
            sub: string;
        };
    }): Promise<{
        isOwner: boolean;
        isSitter: boolean;
        owner: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            profileImageUrl: string | null;
        };
        pet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            imageUrl: string | null;
            breed: string | null;
        };
        service: {
            id: string;
            name: string;
        };
        sitter: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            profileImageUrl: string | null;
        };
        review: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            rating: number;
            comment: string | null;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        sitterId: string;
        ownerId: string;
        petId: string;
        scheduledTime: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        serviceId: string;
    }>;
}
