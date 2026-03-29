"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../prisma/prisma.service");
const r2_service_1 = require("../storage/r2.service");
let OcrService = class OcrService {
    prisma;
    r2Service;
    constructor(prisma, r2Service) {
        this.prisma = prisma;
        this.r2Service = r2Service;
    }
    async handleUpload(file, userId) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        if (!file.mimetype.includes('image') &&
            file.mimetype !== 'application/pdf') {
            throw new Error('Invalid file type');
        }
        const uploaded = await this.r2Service.upload(file.buffer, file.originalname, file.mimetype, 'uploads/ids');
        const tempDir = path.join(process.cwd(), 'uploads', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFilePath = path.join(tempDir, `ocr_${Date.now()}_${file.originalname}`);
        fs.writeFileSync(tempFilePath, file.buffer);
        return new Promise((resolve, reject) => {
            const scriptPath = 'scripts/ocr.py';
            (0, child_process_1.exec)(`python3.13 ${scriptPath} "${tempFilePath}"`, (err, stdout) => {
                (async () => {
                    try {
                        if (fs.existsSync(tempFilePath)) {
                            fs.unlinkSync(tempFilePath);
                        }
                    }
                    catch (cleanupErr) {
                        console.error('Failed to cleanup temp file:', cleanupErr);
                    }
                    if (err) {
                        console.error(err);
                        return reject(new Error('OCR failed: ' + err.message));
                    }
                    try {
                        const ocrResult = JSON.parse(stdout);
                        const parsed = this.parseText(ocrResult.text);
                        const detected = parsed.documentType !== 'UNKNOWN';
                        const dbStatus = detected ? 'VERIFIED' : 'UNVERIFIED';
                        const clientStatus = dbStatus;
                        let profile = await this.prisma.profile.findUnique({
                            where: { userId },
                        });
                        if (!profile) {
                            profile = await this.prisma.profile.create({
                                data: {
                                    user: { connect: { id: userId } },
                                },
                            });
                        }
                        const doc = await this.prisma.document.upsert({
                            where: { profileId: profile.id },
                            update: {
                                fileUrl: uploaded.url,
                                fileKey: uploaded.key,
                                status: dbStatus,
                            },
                            create: {
                                profileId: profile.id,
                                fileUrl: uploaded.url,
                                fileKey: uploaded.key,
                                status: dbStatus,
                            },
                        });
                        resolve({
                            status: clientStatus,
                            documentType: parsed.documentType,
                            documentId: doc.id,
                            url: uploaded.url,
                        });
                    }
                    catch (e) {
                        console.error('Error parsing/saving:', e);
                        reject(new Error('Processing failed: ' +
                            (e instanceof Error ? e.message : 'Unknown error')));
                    }
                })().catch((error) => {
                    console.error('Unhandled error in OCR callback:', error);
                    reject(error instanceof Error ? error : new Error(String(error)));
                });
            });
        });
    }
    parseText(text) {
        const cleanedText = text.replace(/\s+/g, ' ').trim();
        const keywords = [
            'الجمهورية اللبنانية',
            'لبنانية',
            'جمهورية',
            'بطاقة هوية',
            'هوية',
            'جواز سفر',
            'Passport',
            'رخصة سوق',
            'DRIVING LICENSE',
            'PERMIS DE CONDUIRE',
        ];
        const detectedType = keywords.some((k) => cleanedText.toLowerCase().includes(k.toLowerCase()))
            ? 'LEBANESE_DOCUMENT'
            : 'UNKNOWN';
        let specificType = detectedType;
        if (cleanedText.includes('بطاقة هوية') || cleanedText.includes('هوية'))
            specificType = 'ID_CARD';
        if (cleanedText.includes('جواز سفر') ||
            cleanedText.toLowerCase().includes('passport'))
            specificType = 'PASSPORT';
        if (cleanedText.includes('رخصة سوق') ||
            cleanedText.toLowerCase().includes('driving license'))
            specificType = 'DRIVING_LICENSE';
        return {
            documentType: specificType,
        };
    }
    async getVerificationStatus(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { document: true },
        });
        if (!profile || !profile.document) {
            throw new common_1.HttpException({
                status: 'NONE',
                message: 'No document uploaded',
            }, 410);
        }
        const document = profile.document;
        if (document.status === 'UNVERIFIED') {
            throw new common_1.HttpException({
                status: 'UNVERIFIED',
                documentId: document.id,
                message: 'Document uploaded but not verified',
            }, 410);
        }
        return {
            status: document.status,
            documentId: document.id,
            uploadedAt: document.createdAt,
            rejectionReason: null,
        };
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        r2_service_1.R2Service])
], OcrService);
//# sourceMappingURL=ocr.service.js.map