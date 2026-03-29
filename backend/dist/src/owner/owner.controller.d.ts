import { Role } from '@prisma/client';
import { OwnerService } from './owner.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { R2Service } from '../storage/r2.service';
import { ApplicationsService } from '../applications/applications.service';
export declare class OwnerController {
    private readonly ownerService;
    private readonly r2Service;
    private readonly applicationsService;
    constructor(ownerService: OwnerService, r2Service: R2Service, applicationsService: ApplicationsService);
    getRequests(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        sitter: {
            id: string;
            firstname: string;
            lastname: string;
            profileImageUrl: string | null;
            profile: {
                location: {
                    name: string;
                } | null;
            } | null;
        };
        post: {
            id: string;
            location: string;
            service: {
                name: string;
            };
            title: string;
            duration: string;
        };
    }[]>;
    getHome(req: {
        user: {
            sub: string;
            roles: Role[];
        };
    }): Promise<import("./dto/owner-home.dto").OwnerHomeFeedDto>;
    getPets(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        name: string;
        imageUrl: string | null;
        breed: string | null;
    }[]>;
    createPet(req: {
        user: {
            sub: string;
        };
    }, dto: CreatePetDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        imageUrl: string | null;
        breed: string | null;
    }>;
    uploadPetImage(req: {
        user: {
            sub: string;
        };
    }, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    deletePet(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        message: string;
    }>;
}
