import { ConfigService } from '@nestjs/config';
export declare class R2Service {
    private configService;
    private r2Client;
    constructor(configService: ConfigService);
    upload(buffer: Buffer, fileName: string, mimeType: string, folder?: string): Promise<{
        key: string;
        url: string;
    }>;
    delete(key: string): Promise<void>;
    extractKeyFromUrl(url: string): string | null;
}
