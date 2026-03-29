export declare class BookingDto {
    id: string;
    time: string;
    location: string;
    service: {
        id: string;
        name: string;
    };
    owner: {
        id: string;
        firstname: string;
        lastname: string;
        imageUrl?: string;
    };
    pet: {
        id: string;
        name: string;
    };
}
