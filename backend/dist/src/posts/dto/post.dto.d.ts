export declare class PostDto {
    id: string;
    title: string;
    location: string;
    duration: string;
    price: number;
    scheduledTime: string;
    service: {
        id: string;
        name: string;
    };
    owner: {
        id: string;
        firstname: string;
        lastname: string;
    };
    isApplied?: boolean;
}
