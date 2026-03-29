import { PrismaService } from '../prisma/prisma.service';
import { OwnerHomeFeedDto } from './dto/owner-home.dto';
import { CreatePetDto } from './dto/create-pet.dto';
import { R2Service } from '../storage/r2.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OwnerService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getHomeFeed(userId: string): Promise<OwnerHomeFeedDto>;
    getPets(ownerId: string): Promise<{
        id: string;
        name: string;
        imageUrl: string | null;
        breed: string | null;
    }[]>;
    createPet(ownerId: string, dto: CreatePetDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        imageUrl: string | null;
        breed: string | null;
    }>;
    deletePet(ownerId: string, petId: string, r2Service: R2Service): Promise<{
        message: string;
    }>;
    uploadPetImage(ownerId: string, file: Express.Multer.File, r2Service: R2Service): Promise<{
        imageUrl: string;
    }>;
}
