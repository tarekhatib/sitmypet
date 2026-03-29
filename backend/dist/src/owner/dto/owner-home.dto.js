"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerHomeFeedDto = exports.NearbySittersDto = exports.SitterHistoryDto = exports.TodaysBookingDto = void 0;
class TodaysBookingDto {
    id;
    status;
    sitterName;
    sitterImageURL;
    petName;
    service;
    location;
    time;
}
exports.TodaysBookingDto = TodaysBookingDto;
class SitterHistoryDto {
    id;
    sitterName;
    sitterImageUrl;
    location;
    lastBookingDate;
}
exports.SitterHistoryDto = SitterHistoryDto;
class NearbySittersDto {
    id;
    sitterName;
    sitterImageUrl;
    location;
    rating;
    reviewCount;
    isSaved;
}
exports.NearbySittersDto = NearbySittersDto;
class OwnerHomeFeedDto {
    todaysBookings;
    recentSitters;
    nearbySitters;
    unreadCount;
}
exports.OwnerHomeFeedDto = OwnerHomeFeedDto;
//# sourceMappingURL=owner-home.dto.js.map