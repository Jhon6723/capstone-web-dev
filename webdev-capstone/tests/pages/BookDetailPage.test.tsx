import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../src/contexts/auth-context";
import { LibraryContext, type LibraryContextValue } from "../../src/contexts/library-context";
import { useLoanedWorkKeys } from "../../src/hooks/useLoanedWorkKeys";
import BookDetailPage from "../../src/pages/book-detail/BookDetailPage";
import { fetchWork } from "../../src/services/open-library/works";
import type { Loan } from "../../src/types/library";
import { makeAuth, makeLibrary, makeLoan } from "../helpers";

vi.mock("../../src/services/open-library/works", () => ({
    fetchWork: vi.fn(),
}));

vi.mock("../../src/hooks/useLoanedWorkKeys", () => ({
    useLoanedWorkKeys: vi.fn(),
}));

const fetchWorkMock = vi.mocked(fetchWork);
const loanedMock = vi.mocked(useLoanedWorkKeys);

const detail = {
    title: "El libro",
    authors: ["Autora Uno"],
    description: "Descripción",
    subjects: ["fantasy"],
    coverId: 42,
    firstPublishYear: 1954,
};

function renderDetail(
    library: LibraryContextValue,
    user = true,
    loaned: Set<string> | null = new Set()
) {
    loanedMock.mockReturnValue({ loaned, error: loaned === null });
    render(
        <AuthContext.Provider value={makeAuth(user ? {} : { user: null })}>
            <LibraryContext.Provider value={library}>
                <MemoryRouter initialEntries={["/books/OL1W"]}>
                    <Routes>
                        <Route path="/books/:workKey" element={<BookDetailPage />} />
                        <Route path="/login" element={<p>Página de login</p>} />
                    </Routes>
                </MemoryRouter>
            </LibraryContext.Provider>
        </AuthContext.Provider>
    );
}

describe("BookDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchWorkMock.mockResolvedValue(detail);
    });

    it("ofrece iniciar sesión cuando no hay usuario", async () => {
        renderDetail(makeLibrary(), false);

        expect(
            await screen.findByRole("link", {
                name: "Inicia sesión para pedir prestado o reservar",
            })
        ).toBeInTheDocument();
    });

    it("permite pedir prestado un libro disponible", async () => {
        const library = makeLibrary();
        renderDetail(library, true, new Set());

        expect(await screen.findByText("Disponible")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Pedir prestado" }));

        expect(library.borrow).toHaveBeenCalledWith({
            workKey: "OL1W",
            title: "El libro",
            authors: ["Autora Uno"],
            coverId: 42,
            firstPublishYear: 1954,
        });
        expect(await screen.findByRole("status")).toHaveTextContent("Préstamo registrado.");
    });

    it("permite reservar un libro prestado por otro usuario", async () => {
        const library = makeLibrary();
        renderDetail(library, true, new Set(["OL1W"]));

        expect(await screen.findByText("Prestado")).toBeInTheDocument();
        await userEvent.click(await screen.findByRole("button", { name: "Reservar" }));

        expect(library.reserve).toHaveBeenCalledWith(expect.objectContaining({ workKey: "OL1W" }));
    });

    it("permite devolver cuando el usuario tiene el préstamo", async () => {
        const loan: Loan = makeLoan();
        const library = makeLibrary({ activeLoanFor: vi.fn(() => loan) });
        renderDetail(library, true, new Set(["OL1W"]));

        await userEvent.click(await screen.findByRole("button", { name: "Devolver" }));

        expect(library.returnLoan).toHaveBeenCalledWith("l1");
    });

    it("muestra el error cuando el préstamo no se completa", async () => {
        const library = makeLibrary({
            borrow: vi.fn().mockResolvedValue({ ok: false, error: "Este libro ya está prestado." }),
        });
        renderDetail(library, true, new Set());

        await userEvent.click(await screen.findByRole("button", { name: "Pedir prestado" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Este libro ya está prestado.");
    });

    it("permite reintentar cuando el detalle falla", async () => {
        fetchWorkMock.mockRejectedValueOnce(new Error("fail")).mockResolvedValue(detail);
        renderDetail(makeLibrary());

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ocurrió un error al cargar el detalle del libro."
        );
        await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

        expect(await screen.findByRole("heading", { name: "El libro" })).toBeInTheDocument();
        expect(fetchWorkMock).toHaveBeenCalledTimes(2);
    });

    it("cambia el estado de lectura desde el selector", async () => {
        const library = makeLibrary();
        renderDetail(library);

        await screen.findByRole("heading", { name: "El libro" });
        await userEvent.selectOptions(screen.getByLabelText("Estado de lectura"), "wishlist");

        expect(library.setReadingStatus).toHaveBeenCalledWith(
            expect.objectContaining({ workKey: "OL1W" }),
            "wishlist"
        );
    });

    it("quita el estado de lectura al elegir Sin estado", async () => {
        const library = makeLibrary({
            entryFor: vi.fn(() => ({
                book: { workKey: "OL1W", title: "El libro", authors: [] },
                status: "wishlist" as const,
                updatedAt: "2026-01-01T00:00:00Z",
            })),
        });
        renderDetail(library);

        await screen.findByRole("heading", { name: "El libro" });
        await userEvent.selectOptions(screen.getByLabelText("Estado de lectura"), "");

        expect(library.removeEntry).toHaveBeenCalledWith("OL1W");
    });

    it("avisa cuando no se puede comprobar la disponibilidad", async () => {
        renderDetail(makeLibrary(), true, null);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo comprobar la disponibilidad. Recarga la página."
        );
    });
});
