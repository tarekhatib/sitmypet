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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_service_1 = require("../auth/auth.service");
const r2_service_1 = require("../storage/r2.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const change_password_dto_1 = require("./dto/change-password.dto");
const delete_account_dto_1 = require("./dto/delete-account.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const users_service_1 = require("./users.service");
const ocr_service_1 = require("../ocr/ocr.service");
const user_review_dto_1 = require("./dto/user-review.dto");
let UsersController = class UsersController {
    usersService;
    ocrService;
    r2Service;
    authService;
    constructor(usersService, ocrService, r2Service, authService) {
        this.usersService = usersService;
        this.ocrService = ocrService;
        this.r2Service = r2Service;
        this.authService = authService;
    }
    async me(req) {
        return this.usersService.getMe(req.user.sub);
    }
    async uploadProfileImage(req, file) {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        const uploaded = await this.r2Service.upload(file.buffer, file.originalname, file.mimetype, 'uploads/pfps');
        return this.usersService.updateProfileImage(req.user.sub, uploaded.url);
    }
    async updateProfile(req, dto) {
        const user = await this.usersService.updateProfile(req.user.sub, dto);
        if (dto.email) {
            await this.authService.resendEmailOtp(dto.email);
        }
        return user;
    }
    async uploadIdDocument(req, file) {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|heic|heif)$|^application\/pdf$/)) {
            throw new common_1.BadRequestException('Invalid file type. Supported types: JPG, JPEG, PNG, HEIC, PDF');
        }
        const res = await this.ocrService.handleUpload(file, req.user.sub);
        return res;
    }
    async changePassword(req, dto) {
        return this.usersService.changePassword(req.user.sub, dto.oldPassword, dto.newPassword);
    }
    async deleteAccount(req, dto) {
        return this.usersService.deleteAccount(req.user.sub, dto.password);
    }
    async getUserProfile(req, targetUserId) {
        return this.usersService.getUserProfile(targetUserId, req.user?.sub);
    }
    async reviewUser(req, targetUserId, dto) {
        return this.usersService.reviewUser(req.user.sub, targetUserId, dto.rating);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('me/profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('me/id-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadIdDocument", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Delete)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, delete_account_dto_1.DeleteAccountDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Post)(':id/reviews'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, user_review_dto_1.UserReviewDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reviewUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        ocr_service_1.OcrService,
        r2_service_1.R2Service,
        auth_service_1.AuthService])
], UsersController);
//# sourceMappingURL=users.controller.js.map