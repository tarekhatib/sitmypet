import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private resend?;
    private from?;
    constructor(configService: ConfigService);
    private getFrom;
    sendOtp(email: string, otp: string): Promise<void>;
    sendPasswordResetOtp(email: string, otp: string): Promise<void>;
    sendContactForm(fullName: string, email: string, subject: string, message: string): Promise<void>;
}
