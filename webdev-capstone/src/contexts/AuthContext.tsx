import type React from "react";
import { useMemo, useState } from "react";
import { readJson, removeKey, storageKey, writeJson } from "../services/storage/storage";
import type { PublicUser, Session, User } from "../types/auth";
import type { AuthContextValue, AuthResult } from "./auth-context";
import { AuthContext } from "./auth-context";

const USERS_KEY = storageKey("users");
const SESSION_KEY = storageKey("session");
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toPublicUser(user: User): PublicUser {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

async function hashPassword(password: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function readUsers(): User[] {
    return readJson<User[]>(USERS_KEY, []);
}

function createSession(userId: string): void {
    const session: Session = {
        userId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    writeJson(SESSION_KEY, session);
}

function restoreUser(): PublicUser | null {
    const session = readJson<Session | null>(SESSION_KEY, null);
    if (!session) return null;
    const found = readUsers().find((u) => u.id === session.userId);
    if (!found || new Date(session.expiresAt) <= new Date()) {
        removeKey(SESSION_KEY);
        return null;
    }
    return toPublicUser(found);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<PublicUser | null>(restoreUser);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            login: async (email, password): Promise<AuthResult> => {
                const found = readUsers().find(
                    (u) => u.email === email.trim().toLowerCase()
                );
                if (!found || (await hashPassword(password)) !== found.passwordHash) {
                    return { ok: false, error: "Email o contraseña incorrectos." };
                }
                createSession(found.id);
                setUser(toPublicUser(found));
                return { ok: true };
            },
            register: async (name, email, password): Promise<AuthResult> => {
                const users = readUsers();
                const normalized = email.trim().toLowerCase();
                if (users.some((u) => u.email === normalized)) {
                    return { ok: false, error: "Ya existe una cuenta con ese email." };
                }
                const created: User = {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    email: normalized,
                    passwordHash: await hashPassword(password),
                    createdAt: new Date().toISOString(),
                };
                writeJson(USERS_KEY, [...users, created]);
                createSession(created.id);
                setUser(toPublicUser(created));
                return { ok: true };
            },
            logout: () => {
                removeKey(SESSION_KEY);
                setUser(null);
            },
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
