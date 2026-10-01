import { createContext, useContext } from "react";
import type { PublicUser } from "../types/auth";

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface AuthContextValue {
    user: PublicUser | null;
    login: (email: string, password: string) => Promise<AuthResult>;
    register: (name: string, email: string, password: string) => Promise<AuthResult>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
