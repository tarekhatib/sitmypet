import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../storage/r2.service';
export declare class OcrService {
    private prisma;
    private r2Service;
    constructor(prisma: PrismaService, r2Service: R2Service);
    handleUpload(file: Express.Multer.File, userId: string): Promise<unknown>;
    parseText(text: string): {
        documentType: string;
    };
    getVerificationStatus(userId: string): Promise<{
        status: string;
        documentId: string;
        uploadedAt: Date;
        rejectionReason: null;
    }>;
}
