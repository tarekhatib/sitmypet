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
exports.ExploreQueryDto = exports.SortBy = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var SortBy;
(function (SortBy) {
    SortBy["DEFAULT"] = "";
    SortBy["PRICE_LOW_TO_HIGH"] = "price_low";
    SortBy["PRICE_HIGH_TO_LOW"] = "price_high";
    SortBy["RATING_HIGH_TO_LOW"] = "rating";
    SortBy["MOST_REVIEWS"] = "most_reviews";
    SortBy["NEAREST_FIRST"] = "nearest_first";
    SortBy["HIGHEST_RATED"] = "highest_rated";
    SortBy["LOWEST_PRICE"] = "lowest_price";
    SortBy["HIGHEST_PRICE"] = "highest_price";
})(SortBy || (exports.SortBy = SortBy = {}));
class ExploreQueryDto {
    search;
    services;
    location;
    sortBy;
    minRating;
    page = 1;
    limit = 20;
}
exports.ExploreQueryDto = ExploreQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExploreQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExploreQueryDto.prototype, "services", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExploreQueryDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortBy),
    __metadata("design:type", String)
], ExploreQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExploreQueryDto.prototype, "minRating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExploreQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExploreQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=explore-query.dto.js.map