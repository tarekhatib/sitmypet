import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, emailService: EmailService);
    register(dto: RegisterDto): Promise<{
        requiresEmailVerification: boolean;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            roles: Role[];
            createdAt: Date;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    verifyEmailOtp(email: string, otp: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            roles: import("@prisma/client").$Enums.Role[];
            createdAt: Date;
        };
    }>;
    resendEmailOtp(email: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    verifyPasswordResetOtp(email: string, otp: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    private hashToken;
    private compareToken;
    private generateTokens;
    private saveRefreshToken;
    private emailToLowerCase;
    private generateOtp;
    private saveEmailOtp;
    private savePasswordResetOtp;
}
