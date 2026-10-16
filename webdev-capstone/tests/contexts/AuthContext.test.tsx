import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../src/contexts/AuthContext";
import { useAuth } from "../../src/contexts/auth-context";

const authApi = vi.hoisted(() => ({
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock("../../src/services/supabase/client", () => ({
    supabase: { auth: authApi },
}));

type AuthCallback = (event: string, session: unknown) => void;

function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}

const session = {
    user: {
        id: "u1",
        email: "ana@correo.com",
        created_at: "2026-01-01T00:00:00Z",
        user_metadata: { name: "Ana" },
    },
};

describe("AuthContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authApi.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
    });

    function fireCallback(sessionValue: unknown) {
        const callback = authApi.onAuthStateChange.mock.calls[0][0] as AuthCallback;
        act(() => callback("INITIAL_SESSION", sessionValue));
    }

    it("informa loading hasta que llega el estado de sesión", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();

        fireCallback(session);

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual({
            id: "u1",
            name: "Ana",
            email: "ana@correo.com",
            createdAt: "2026-01-01T00:00:00Z",
        });
    });

    it("login normaliza el email y traduce credenciales inválidas", async () => {
        authApi.signInWithPassword.mockResolvedValue({ data: {}, error: null });
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
        fireCallback(session);

        await act(async () => {
            await result.current.login("  Ana@Correo.com ", "secreta");
        });
        expect(authApi.signInWithPassword).toHaveBeenCalledWith({
            email: "ana@correo.com",
            password: "secreta",
        });

        authApi.signInWithPassword.mockResolvedValue({
            data: {},
            error: { code: "invalid_credentials" },
        });
        let loginResult: unknown;
        await act(async () => {
            loginResult = await result.current.login("ana@correo.com", "mala");
        });
        expect(loginResult).toEqual({
            ok: false,
            error: "Email o contraseña incorrectos.",
        });
    });

    it("register detecta correo existente y cuenta sin confirmar", async () => {
        authApi.signUp.mockResolvedValue({
            data: { user: { identities: [] }, session: null },
            error: null,
        });
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
        fireCallback(session);

        let registerResult: unknown;
        await act(async () => {
            registerResult = await result.current.register("Ana", "ana@correo.com", "secreta123");
        });
        expect(registerResult).toEqual({
            ok: false,
            error: "Ya existe una cuenta con ese email.",
        });

        authApi.signUp.mockResolvedValue({
            data: { user: { identities: [{}] }, session: null },
            error: null,
        });
        await act(async () => {
            registerResult = await result.current.register(
                "  Ana  ",
                "ana@correo.com",
                "secreta123"
            );
        });
        expect(registerResult).toEqual({
            ok: false,
            error: "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.",
        });
        expect(authApi.signUp).toHaveBeenLastCalledWith(
            expect.objectContaining({
                options: { data: { name: "Ana" } },
            })
        );
    });

    it("cancela la suscripción al desmontar", () => {
        const unsubscribe = vi.fn();
        authApi.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe } },
        });
        const { unmount } = renderHook(() => useAuth(), { wrapper: Wrapper });

        unmount();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
