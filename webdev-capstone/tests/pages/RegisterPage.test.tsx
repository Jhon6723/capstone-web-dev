import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../../src/contexts/auth-context";
import RegisterPage from "../../src/pages/auth/RegisterPage";
import { makeAuth } from "../helpers";

function renderRegister(auth: AuthContextValue, from?: string) {
    render(
        <AuthContext.Provider value={auth}>
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/register",
                        state: from ? { from: { pathname: from } } : null,
                    },
                ]}
            >
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<p>Catálogo</p>} />
                    <Route path="/wishlist" element={<p>Lista de deseos</p>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

async function fillForm(values: {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
}) {
    if (values.name !== undefined)
        await userEvent.type(screen.getByLabelText("Nombre"), values.name);
    if (values.email !== undefined)
        await userEvent.type(screen.getByLabelText("Email"), values.email);
    if (values.password !== undefined)
        await userEvent.type(screen.getByLabelText("Contraseña"), values.password);
    if (values.confirm !== undefined)
        await userEvent.type(screen.getByLabelText("Confirmar contraseña"), values.confirm);
}

describe("RegisterPage", () => {
    it("valida los campos antes de registrar", async () => {
        const register = vi.fn();
        renderRegister(makeAuth({ user: null, register }));

        await fillForm({ email: "ana@correo.com", password: "corta", confirm: "otra" });
        await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        expect(screen.getByText("Ingresa tu nombre.")).toBeInTheDocument();
        expect(screen.getByText("Mínimo 8 caracteres.")).toBeInTheDocument();
        expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
        expect(register).not.toHaveBeenCalled();
    });

    it("muestra el error del servicio de registro", async () => {
        const register = vi.fn().mockResolvedValue({
            ok: false,
            error: "Ya existe una cuenta con ese email.",
        });
        renderRegister(makeAuth({ user: null, register }));

        await fillForm({
            name: "Ana",
            email: "ana@correo.com",
            password: "secreta123",
            confirm: "secreta123",
        });
        await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ya existe una cuenta con ese email."
        );
        expect(register).toHaveBeenCalledWith("Ana", "ana@correo.com", "secreta123");
    });

    it("vuelve a la página protegida después de registrarse", async () => {
        const register = vi.fn().mockResolvedValue({ ok: true });
        renderRegister(makeAuth({ user: null, register }), "/wishlist");

        await fillForm({
            name: "Ana",
            email: "ana@correo.com",
            password: "secreta123",
            confirm: "secreta123",
        });
        await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        expect(await screen.findByText("Lista de deseos")).toBeInTheDocument();
    });
});
