export declare enum SortBy {
    DEFAULT = "",
    PRICE_LOW_TO_HIGH = "price_low",
    PRICE_HIGH_TO_LOW = "price_high",
    RATING_HIGH_TO_LOW = "rating",
    MOST_REVIEWS = "most_reviews",
    NEAREST_FIRST = "nearest_first",
    HIGHEST_RATED = "highest_rated",
    LOWEST_PRICE = "lowest_price",
    HIGHEST_PRICE = "highest_price"
}
export declare class ExploreQueryDto {
    search?: string;
    services?: string;
    location?: string;
    sortBy?: SortBy;
    minRating?: number;
    page?: number;
    limit?: number;
}
