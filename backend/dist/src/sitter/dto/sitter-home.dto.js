"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitterHomeFeedDto = exports.NearbyPostDto = exports.ClientHistoryDto = exports.TodaysBookingDto = void 0;
class TodaysBookingDto {
    id;
    status;
    ownerName;
    petName;
    ownerImageURL;
    service;
    location;
    time;
}
exports.TodaysBookingDto = TodaysBookingDto;
class ClientHistoryDto {
    id;
    ownerName;
    ownerImageUrl;
    location;
    lastBookingDate;
}
exports.ClientHistoryDto = ClientHistoryDto;
class NearbyPostDto {
    id;
    title;
    location;
    service;
    duration;
    rating;
    reviewCount;
    imageUrl;
    isSaved;
}
exports.NearbyPostDto = NearbyPostDto;
class SitterHomeFeedDto {
    todaysBookings;
    recentClients;
    nearbyPosts;
    unreadCount;
}
exports.SitterHomeFeedDto = SitterHomeFeedDto;
//# sourceMappingURL=sitter-home.dto.js.map