"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExploreResponseDto = exports.PostDto = void 0;
class PostDto {
    id;
    ownerName;
    imageUrl;
    title;
    location;
    service;
    duration;
    createdAt;
    price;
    rating;
    reviewCount;
}
exports.PostDto = PostDto;
class ExploreResponseDto {
    posts;
    total;
    page;
    limit;
    totalPages;
}
exports.ExploreResponseDto = ExploreResponseDto;
//# sourceMappingURL=explore-response.dto.js.map