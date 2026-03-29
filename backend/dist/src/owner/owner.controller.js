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
exports.OwnerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const owner_service_1 = require("./owner.service");
const create_pet_dto_1 = require("./dto/create-pet.dto");
const r2_service_1 = require("../storage/r2.service");
const applications_service_1 = require("../applications/applications.service");
let OwnerController = class OwnerController {
    ownerService;
    r2Service;
    applicationsService;
    constructor(ownerService, r2Service, applicationsService) {
        this.ownerService = ownerService;
        this.r2Service = r2Service;
        this.applicationsService = applicationsService;
    }
    async getRequests(req) {
        return this.applicationsService.getOwnerRequests(req.user.sub);
    }
    async getHome(req) {
        const userId = req.user.sub;
        return this.ownerService.getHomeFeed(userId);
    }
    async getPets(req) {
        return this.ownerService.getPets(req.user.sub);
    }
    async createPet(req, dto) {
        return this.ownerService.createPet(req.user.sub, dto);
    }
    async uploadPetImage(req, file) {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        return this.ownerService.uploadPetImage(req.user.sub, file, this.r2Service);
    }
    async deletePet(id, req) {
        return this.ownerService.deletePet(req.user.sub, id, this.r2Service);
    }
};
exports.OwnerController = OwnerController;
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Get)('home'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "getHome", null);
__decorate([
    (0, common_1.Get)('pets'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "getPets", null);
__decorate([
    (0, common_1.Post)('pets'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_pet_dto_1.CreatePetDto]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "createPet", null);
__decorate([
    (0, common_1.Post)('pets/upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "uploadPetImage", null);
__decorate([
    (0, common_1.Delete)('pets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnerController.prototype, "deletePet", null);
exports.OwnerController = OwnerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('owner'),
    __metadata("design:paramtypes", [owner_service_1.OwnerService,
        r2_service_1.R2Service,
        applications_service_1.ApplicationsService])
], OwnerController);
//# sourceMappingURL=owner.controller.js.map