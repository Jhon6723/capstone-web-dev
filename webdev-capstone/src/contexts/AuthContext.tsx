import type { AuthError, User } from "@supabase/supabase-js";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase/client";
import type { PublicUser } from "../types/auth";
import type { AuthContextValue, AuthResult } from "./auth-context";
import { AuthContext } from "./auth-context";

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: (user.user_metadata?.name as string | undefined) ?? "",
        email: user.email ?? "",
        createdAt: user.created_at,
    };
}

function mapAuthError(error: AuthError): string {
    switch (error.code) {
        case "invalid_credentials":
            return "Email o contraseña incorrectos.";
        case "user_already_exists":
        case "email_exists":
            return "Ya existe una cuenta con ese email.";
        case "email_not_confirmed":
            return "Debes confirmar tu correo antes de iniciar sesión.";
        case "weak_password":
            return "La contraseña es demasiado débil.";
        default:
            return "No se pudo completar la operación. Intenta de nuevo.";
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? toPublicUser(session.user) : null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            login: async (email, password): Promise<AuthResult> => {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim().toLowerCase(),
                    password,
                });
                if (error) return { ok: false, error: mapAuthError(error) };
                return { ok: true };
            },
            register: async (name, email, password): Promise<AuthResult> => {
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                    options: { data: { name: name.trim() } },
                });
                if (error) return { ok: false, error: mapAuthError(error) };
                if (data.user?.identities?.length === 0) {
                    return { ok: false, error: "Ya existe una cuenta con ese email." };
                }
                if (!data.session) {
                    return {
                        ok: false,
                        error: "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.",
                    };
                }
                return { ok: true };
            },
            logout: () => {
                void supabase.auth.signOut();
            },
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
