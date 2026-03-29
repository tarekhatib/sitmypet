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
exports.SitterController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const explore_query_dto_1 = require("./dto/explore-query.dto");
const sitter_service_1 = require("./sitter.service");
let SitterController = class SitterController {
    sitterService;
    constructor(sitterService) {
        this.sitterService = sitterService;
    }
    async getHome(req) {
        const userId = req.user.sub;
        return this.sitterService.getHomeFeed(userId);
    }
    async explore(query, req) {
        const userId = req.user.sub;
        return this.sitterService.explore(query, userId);
    }
    async toggleSavePost(postId, req) {
        const userId = req.user.sub;
        return this.sitterService.toggleSavedPost(userId, postId);
    }
    async getSavedPosts(req) {
        const userId = req.user.sub;
        return this.sitterService.getSavedPosts(userId);
    }
};
exports.SitterController = SitterController;
__decorate([
    (0, common_1.Get)('home'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SitterController.prototype, "getHome", null);
__decorate([
    (0, common_1.Get)('explore'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [explore_query_dto_1.ExploreQueryDto, Object]),
    __metadata("design:returntype", Promise)
], SitterController.prototype, "explore", null);
__decorate([
    (0, common_1.Post)('posts/:id/toggle-save'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SitterController.prototype, "toggleSavePost", null);
__decorate([
    (0, common_1.Get)('saved-posts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SitterController.prototype, "getSavedPosts", null);
exports.SitterController = SitterController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sitter'),
    __metadata("design:paramtypes", [sitter_service_1.SitterService])
], SitterController);
//# sourceMappingURL=sitter.controller.js.map