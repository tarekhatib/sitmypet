import { OcrService } from './ocr.service';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        email: string;
        roles: string[];
    };
}
export declare class OcrController {
    private ocrService;
    constructor(ocrService: OcrService);
    upload(file: Express.Multer.File, req: AuthenticatedRequest): Promise<unknown>;
    getStatus(req: AuthenticatedRequest): Promise<{
        status: string;
        documentId: string;
        uploadedAt: Date;
        rejectionReason: null;
    }>;
}
export {};
