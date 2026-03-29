import { AuthService } from '../auth/auth.service';
import { R2Service } from '../storage/r2.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { OcrService } from '../ocr/ocr.service';
import { UserReviewDto } from './dto/user-review.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly ocrService;
    private readonly r2Service;
    private readonly authService;
    constructor(usersService: UsersService, ocrService: OcrService, r2Service: R2Service, authService: AuthService);
    me(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        location: {
            id: string;
            name: string;
        } | null;
        document: {
            id: string;
            status: string;
            fileKey: string | null;
            fileUrl: string;
        } | null;
        id: string;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
        profile: {
            location: {
                id: string;
                name: string;
            } | null;
            document: {
                id: string;
                status: string;
                fileKey: string | null;
                fileUrl: string;
            } | null;
        } | null;
    }>;
    uploadProfileImage(req: {
        user: {
            sub: string;
        };
    }, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    updateProfile(req: {
        user: {
            sub: string;
        };
    }, dto: UpdateUserDto): Promise<{
        location: {
            id: string;
            name: string;
        } | null;
        document: {
            id: string;
            status: string;
            fileKey: string | null;
            fileUrl: string;
        } | null;
        id: string;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
        profile: {
            location: {
                id: string;
                name: string;
            } | null;
            document: {
                id: string;
                status: string;
                fileKey: string | null;
                fileUrl: string;
            } | null;
        } | null;
    }>;
    uploadIdDocument(req: {
        user: {
            sub: string;
        };
    }, file: Express.Multer.File): Promise<unknown>;
    changePassword(req: {
        user: {
            sub: string;
        };
    }, dto: ChangePasswordDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    deleteAccount(req: {
        user: {
            sub: string;
        };
    }, dto: DeleteAccountDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        roles: import("@prisma/client").$Enums.Role[];
        firstname: string;
        lastname: string;
        profileImageUrl: string | null;
    }>;
    getUserProfile(req: {
        user: {
            sub: string;
        };
    }, targetUserId: string): Promise<{
        contactInfo: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            profileImageUrl: string | null;
            location: string | null;
        };
        sitterInfo: {
            clientsWorkedWith: number;
            reviewsCount: number;
            averageRating: number;
        };
        ownerInfo: {
            sittersWorkedWith: number;
            jobsPosted: number;
            reviewsCount: number;
            averageRating: number;
        };
        pets: {
            id: string;
            name: string;
            imageUrl: string | null;
            breed: string | null;
        }[];
        posts: {
            id: string;
            location: string;
            scheduledTime: Date;
            status: import("@prisma/client").$Enums.PostStatus;
            pet: {
                id: string;
                name: string;
                imageUrl: string | null;
            } | null;
            service: {
                name: string;
            };
            title: string;
            duration: string;
            imageUrl: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            description: string;
        }[];
        previousRating: number | null;
        reviewsCount: number;
        averageRating: number;
    }>;
    reviewUser(req: {
        user: {
            sub: string;
        };
    }, targetUserId: string, dto: UserReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bookingId: string;
        rating: number;
        comment: string | null;
    }>;
}
