export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: Date;
    avatar_url?: string;
}