import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../../src/contexts/auth-context";
import LoginPage from "../../src/pages/auth/LoginPage";

function renderLogin(login: AuthContextValue["login"], from?: string) {
    const auth: AuthContextValue = {
        user: null,
        loading: false,
        login,
        register: vi.fn(),
        logout: vi.fn(),
    };
    render(
        <AuthContext.Provider value={auth}>
            <MemoryRouter
                initialEntries={[
                    { pathname: "/login", state: from ? { from: { pathname: from } } : null },
                ]}
            >
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<p>Catálogo</p>} />
                    <Route path="/loans" element={<p>Mis préstamos</p>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

describe("LoginPage", () => {
    it("muestra errores y no intenta iniciar sesión con el formulario vacío", async () => {
        const login = vi.fn();
        renderLogin(login);

        await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

        expect(screen.getByText("Ingresa un email válido.")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
            "Ingresa un email válido."
        );
        expect(login).not.toHaveBeenCalled();
    });

    it("vuelve a la página protegida después de iniciar sesión", async () => {
        const login = vi.fn().mockResolvedValue({ ok: true });
        renderLogin(login, "/loans");

        await userEvent.type(screen.getByLabelText("Email"), "ana@correo.com");
        await userEvent.type(screen.getByLabelText("Contraseña"), "secreta123{Enter}");

        expect(await screen.findByText("Mis préstamos")).toBeInTheDocument();
        expect(login).toHaveBeenCalledWith("ana@correo.com", "secreta123");
    });
});
