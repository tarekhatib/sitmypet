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
exports.R2Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
let R2Service = class R2Service {
    configService;
    r2Client;
    constructor(configService) {
        this.configService = configService;
        this.r2Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${this.configService.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.get('R2_ACCESS_KEY'),
                secretAccessKey: this.configService.get('R2_SECRET_KEY'),
            },
        });
    }
    async upload(buffer, fileName, mimeType, folder = 'uploads') {
        const key = `${folder}/${Date.now()}-${fileName}`;
        await this.r2Client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.configService.get('R2_BUCKET'),
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        }));
        const publicUrl = `${this.configService.get('R2_PUBLIC_URL')}/${key}`;
        return {
            key,
            url: publicUrl,
        };
    }
    async delete(key) {
        await this.r2Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.configService.get('R2_BUCKET'),
            Key: key,
        }));
    }
    extractKeyFromUrl(url) {
        const publicUrl = this.configService.get('R2_PUBLIC_URL');
        if (publicUrl && url.startsWith(publicUrl)) {
            return url.slice(publicUrl.length + 1);
        }
        return null;
    }
};
exports.R2Service = R2Service;
exports.R2Service = R2Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2Service);
//# sourceMappingURL=r2.service.js.map