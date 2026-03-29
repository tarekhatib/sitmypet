export declare class ApplicationDto {
    id: string;
    status: 'PENDING' | 'REJECTED';
    post: {
        id: string;
        title: string;
        service: {
            id: string;
            name: string;
        };
    };
    sitter: {
        id: string;
        firstname: string;
        lastname: string;
    };
    createdAt: string;
}
