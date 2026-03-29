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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const email_service_1 = require("../email/email.service");
const users_service_1 = require("../users/users.service");
const REFRESH_TOKEN_DAYS = 30;
const EMAIL_OTP_EXPIRY_MINUTES = 10;
const EMAIL_OTP_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_OTP_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_OTP_MAX_ATTEMPTS = 5;
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    emailService;
    constructor(usersService, jwtService, configService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async register(dto) {
        const email = this.emailToLowerCase(dto.email);
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.createUser({
            firstname: dto.firstname,
            lastname: dto.lastname,
            email,
            passwordHash,
            profileImageUrl: dto.profileImageUrl,
        });
        const otp = this.generateOtp();
        await this.saveEmailOtp(user.id, otp);
        await this.emailService.sendOtp(user.email, otp);
        return {
            requiresEmailVerification: true,
            message: 'Registration successful. Please check your email for the verification code.',
        };
    }
    async login(dto) {
        const email = this.emailToLowerCase(dto.email);
        const user = await this.usersService.findByEmailWithPassword(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.emailVerified) {
            throw new common_1.ForbiddenException();
        }
        const tokens = this.generateTokens(user.id, user.roles);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                roles: user.roles,
                createdAt: user.createdAt,
            },
        };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            const verified = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            payload = verified;
        }
        catch {
            console.log('Refresh token verification failed');
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
        if (!user ||
            !user.refreshTokenHash ||
            !user.refreshTokenExp ||
            !user.refreshTokenJti) {
            console.log('User not found or missing refresh token data');
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (user.refreshTokenExp < new Date()) {
            console.log('Refresh token expired');
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        if (payload.jti !== user.refreshTokenJti) {
            console.log('Refresh token jti mismatch');
            throw new common_1.UnauthorizedException('Refresh token already used');
        }
        const isTokenValid = await this.compareToken(refreshToken, user.refreshTokenHash);
        if (!isTokenValid) {
            console.log('Refresh token hash mismatch');
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = this.generateTokens(user.id, user.roles);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async logout(userId) {
        await this.usersService.clearRefreshToken(userId);
        return { message: 'Logged out successfully' };
    }
    async verifyEmailOtp(email, otp) {
        const normalizedEmail = this.emailToLowerCase(email);
        const user = await this.usersService.findByEmailWithOtp(normalizedEmail);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        if (!user.emailOtpHash || !user.emailOtpExpires) {
            throw new common_1.BadRequestException('No verification code found. Please request a new one.');
        }
        if (user.emailOtpExpires < new Date()) {
            throw new common_1.BadRequestException('Verification code expired. Please request a new one.');
        }
        if (user.emailOtpAttempts >= EMAIL_OTP_MAX_ATTEMPTS) {
            throw new common_1.BadRequestException('Too many attempts. Please request a new code.');
        }
        const isValidOtp = await this.compareToken(otp, user.emailOtpHash);
        if (!isValidOtp) {
            await this.usersService.incrementOtpAttempts(user.id);
            const remaining = EMAIL_OTP_MAX_ATTEMPTS - user.emailOtpAttempts - 1;
            throw new common_1.UnauthorizedException(`Invalid verification code. ${remaining} attempts remaining.`);
        }
        await this.usersService.verifyEmail(user.id);
        const fullUser = await this.usersService.findByEmailWithPassword(normalizedEmail);
        if (!fullUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const tokens = this.generateTokens(fullUser.id, fullUser.roles);
        await this.saveRefreshToken(fullUser.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: fullUser.id,
                firstname: fullUser.firstname,
                lastname: fullUser.lastname,
                email: fullUser.email,
                roles: fullUser.roles,
                createdAt: fullUser.createdAt,
            },
        };
    }
    async resendEmailOtp(email) {
        const normalizedEmail = this.emailToLowerCase(email);
        const user = await this.usersService.findByEmailWithOtp(normalizedEmail);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const otp = this.generateOtp();
        await this.saveEmailOtp(user.id, otp);
        await this.emailService.sendOtp(user.email, otp);
        return { message: 'Verification code sent' };
    }
    async requestPasswordReset(email) {
        const normalizedEmail = this.emailToLowerCase(email);
        const user = await this.usersService.findByEmailWithPasswordResetOtp(normalizedEmail);
        if (!user) {
            return {
                message: 'If an account exists with this email, a password reset code has been sent.',
            };
        }
        const otp = this.generateOtp();
        await this.savePasswordResetOtp(user.id, otp);
        await this.emailService.sendPasswordResetOtp(user.email, otp);
        return {
            message: 'If an account exists with this email, a password reset code has been sent.',
        };
    }
    async verifyPasswordResetOtp(email, otp) {
        const normalizedEmail = this.emailToLowerCase(email);
        const user = await this.usersService.findByEmailWithPasswordResetOtp(normalizedEmail);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
            throw new common_1.BadRequestException('No password reset code found. Please request a new one.');
        }
        if (user.passwordResetOtpExpires < new Date()) {
            throw new common_1.BadRequestException('Password reset code expired. Please request a new one.');
        }
        if (user.passwordResetOtpAttempts >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
            throw new common_1.BadRequestException('Too many attempts. Please request a new code.');
        }
        const isValidOtp = await this.compareToken(otp, user.passwordResetOtpHash);
        if (!isValidOtp) {
            await this.usersService.incrementPasswordResetOtpAttempts(user.id);
            const remaining = PASSWORD_RESET_OTP_MAX_ATTEMPTS - user.passwordResetOtpAttempts - 1;
            throw new common_1.UnauthorizedException(`Invalid reset code. ${remaining} attempts remaining.`);
        }
        return {
            message: 'Reset code is valid',
        };
    }
    async resetPassword(email, otp, newPassword) {
        const normalizedEmail = this.emailToLowerCase(email);
        const user = await this.usersService.findByEmailWithPasswordResetOtp(normalizedEmail);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
            throw new common_1.BadRequestException('No password reset code found. Please request a new one.');
        }
        if (user.passwordResetOtpExpires < new Date()) {
            throw new common_1.BadRequestException('Password reset code expired. Please request a new one.');
        }
        if (user.passwordResetOtpAttempts >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
            throw new common_1.BadRequestException('Too many attempts. Please request a new code.');
        }
        const isValidOtp = await this.compareToken(otp, user.passwordResetOtpHash);
        if (!isValidOtp) {
            await this.usersService.incrementPasswordResetOtpAttempts(user.id);
            const remaining = PASSWORD_RESET_OTP_MAX_ATTEMPTS - user.passwordResetOtpAttempts - 1;
            throw new common_1.UnauthorizedException(`Invalid reset code. ${remaining} attempts remaining.`);
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await this.usersService.resetPassword(user.id, newPasswordHash);
        return {
            message: 'Password reset successful. Log in with your new password.',
        };
    }
    async hashToken(token) {
        return bcrypt.hash(token, 10);
    }
    async compareToken(token, hash) {
        return bcrypt.compare(token, hash);
    }
    generateTokens(userId, roles) {
        const payload = {
            sub: userId,
            roles,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshPayload = {
            ...payload,
            jti: `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        };
        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: `${REFRESH_TOKEN_DAYS}d`,
        });
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, refreshToken) {
        const refreshTokenHash = await this.hashToken(refreshToken);
        const refreshTokenExp = new Date();
        refreshTokenExp.setDate(refreshTokenExp.getDate() + REFRESH_TOKEN_DAYS);
        const decoded = this.jwtService.decode(refreshToken);
        const payload = decoded;
        await this.usersService.updateRefreshToken(userId, refreshTokenHash, payload.jti, refreshTokenExp);
    }
    emailToLowerCase(email) {
        return email.trim().toLowerCase();
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async saveEmailOtp(userId, otp) {
        const otpHash = await this.hashToken(otp);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + EMAIL_OTP_EXPIRY_MINUTES);
        await this.usersService.saveEmailOtp(userId, otpHash, expiresAt);
    }
    async savePasswordResetOtp(userId, otp) {
        const otpHash = await this.hashToken(otp);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_OTP_EXPIRY_MINUTES);
        await this.usersService.savePasswordResetOtp(userId, otpHash, expiresAt);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map