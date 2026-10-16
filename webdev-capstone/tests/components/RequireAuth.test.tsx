import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RequireAuth from "../../src/components/auth/RequireAuth";
import { AuthContext } from "../../src/contexts/auth-context";
import { makeAuth } from "../helpers";

function LoginProbe() {
    const location = useLocation();
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <p>login desde {from ?? "ninguno"}</p>;
}

function renderRequireAuth(auth: ReturnType<typeof makeAuth>) {
    render(
        <AuthContext.Provider value={auth}>
            <MemoryRouter initialEntries={["/loans"]}>
                <Routes>
                    <Route
                        path="/loans"
                        element={
                            <RequireAuth>
                                <p>Contenido protegido</p>
                            </RequireAuth>
                        }
                    />
                    <Route path="/login" element={<LoginProbe />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

describe("RequireAuth", () => {
    it("muestra un estado de carga mientras se comprueba la sesión", () => {
        renderRequireAuth(makeAuth({ user: null, loading: true }));

        expect(screen.getByRole("status")).toHaveTextContent("Comprobando sesión...");
    });

    it("redirige a login recordando la página de origen", () => {
        renderRequireAuth(makeAuth({ user: null }));

        expect(screen.getByText("login desde /loans")).toBeInTheDocument();
        expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    });

    it("muestra el contenido cuando hay sesión", () => {
        renderRequireAuth(makeAuth());

        expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    });
});
