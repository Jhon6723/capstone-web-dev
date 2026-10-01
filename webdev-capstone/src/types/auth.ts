export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
}

export interface Session {
    userId: string;
    token: string;
    expiresAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;
