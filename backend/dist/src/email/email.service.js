"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = class EmailService {
    configService;
    resend;
    from;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.from = this.configService.get('EMAIL_FROM');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        else {
            console.error('RESEND_API_KEY missing. Emails will not be sent.');
        }
    }
    getFrom() {
        if (!this.from) {
            throw new Error('EMAIL_FROM not configured');
        }
        return this.from;
    }
    async sendOtp(email, otp) {
        if (!this.resend) {
            console.error('Resend not initialized. Cannot send OTP email.');
            throw new common_1.InternalServerErrorException('Email service not configured');
        }
        try {
            await this.resend.emails.send({
                from: this.getFrom(),
                to: email,
                subject: 'Your SitMyPet Verification Code',
                html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐾 SitMyPet</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email</h2>
                <p>Thank you for signing up! Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p><strong>This code expires in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2025 SitMyPet. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to send verification email: ${error.message}`);
        }
    }
    async sendPasswordResetOtp(email, otp) {
        if (!this.resend) {
            console.error('Resend not initialized. Cannot send password reset email.');
            throw new common_1.InternalServerErrorException('Email service not configured');
        }
        try {
            await this.resend.emails.send({
                from: this.getFrom(),
                to: email,
                subject: 'Reset Your SitMyPet Password',
                html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐾 SitMyPet</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>You requested to reset your password. Your reset code is:</p>
                <div class="otp-code">${otp}</div>
                <p><strong>This code expires in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email and your password will remain unchanged.</p>
              </div>
              <div class="footer">
                <p>© 2025 SitMyPet. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to send password reset email: ${error.message}`);
        }
    }
    async sendContactForm(fullName, email, subject, message) {
        if (!this.resend) {
            console.error('Resend not initialized. Cannot send contact form email.');
            throw new common_1.InternalServerErrorException('Email service not configured');
        }
        const ramyEmail = 'ramykhb18@gmail.com';
        const tarekEmail = 'tarekalkhatibb@gmail.com';
        try {
            await this.resend.emails.send({
                from: this.getFrom(),
                to: [tarekEmail, ramyEmail],
                subject: `Contact Form: ${subject}`,
                html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #4F46E5; }
              .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>New Contact Form Submission</h2>
                <div class="info-row">
                  <span class="label">From:</span> ${fullName}
                </div>
                <div class="info-row">
                  <span class="label">Email:</span> ${email}
                </div>
                <div class="info-row">
                  <span class="label">Subject:</span> ${subject}
                </div>
                <div class="message-box">
                  <div class="label">Message:</div>
                  <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
              </div>
              <div class="footer">
                <p>© 2025 SitMyPet. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to send contact form email: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map