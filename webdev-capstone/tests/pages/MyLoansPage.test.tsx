import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LibraryContext } from "../../src/contexts/library-context";
import MyLoansPage from "../../src/pages/loans/MyLoansPage";
import type { Loan } from "../../src/types/library";
import { daysFromNow, makeLibrary, makeLoan, makeReservation } from "../helpers";

function loan(id: string, dueInDays: number, extra: Partial<Loan> = {}): Loan {
    return makeLoan({
        id,
        book: { workKey: `OL-${id}`, title: `Libro ${id}`, authors: [] },
        borrowedAt: daysFromNow(-10),
        dueAt: daysFromNow(dueInDays),
        ...(extra.status === "returned" ? { returnedAt: daysFromNow(-1) } : {}),
        ...extra,
    });
}

function reservation(id: string, status: "pending" | "fulfilled") {
    return makeReservation({
        id,
        book: { workKey: `OL-${id}`, title: `Reservado ${id}`, authors: [] },
        createdAt: daysFromNow(-1),
        status,
        ...(status === "fulfilled" ? { notifiedAt: daysFromNow(0) } : {}),
    });
}

function renderPage(overrides = {}) {
    const library = makeLibrary(overrides);
    render(
        <LibraryContext.Provider value={library}>
            <MemoryRouter>
                <MyLoansPage />
            </MemoryRouter>
        </LibraryContext.Provider>
    );
    return library;
}

describe("MyLoansPage", () => {
    it("muestra el estado de carga", () => {
        renderPage({ status: "loading" });

        expect(screen.getByRole("status")).toHaveTextContent("Cargando préstamos...");
    });

    it("permite reintentar cuando la carga falla", async () => {
        const library = renderPage({ status: "error" });

        await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

        expect(library.reload).toHaveBeenCalledTimes(1);
    });

    it("marca vencidos y próximos a vencer en préstamos activos", () => {
        renderPage({
            loans: [loan("vencido", -2), loan("pronto", 2), loan("lejos", 10)],
        });

        const active = within(screen.getByRole("region", { name: "Préstamos activos" }));
        const overdueCard = active.getByText("Libro vencido").closest("li") as HTMLElement;
        const soonCard = active.getByText("Libro pronto").closest("li") as HTMLElement;
        const farCard = active.getByText("Libro lejos").closest("li") as HTMLElement;
        expect(within(overdueCard).getByText("Vencido")).toBeInTheDocument();
        expect(within(soonCard).getByText("Vence pronto")).toBeInTheDocument();
        expect(within(farCard).queryByText("Vencido")).not.toBeInTheDocument();
        expect(within(farCard).queryByText("Vence pronto")).not.toBeInTheDocument();
    });

    it("devuelve un préstamo activo y muestra el error si falla", async () => {
        const library = renderPage({ loans: [loan("l1", 5)] });
        const active = within(screen.getByRole("region", { name: "Préstamos activos" }));

        await userEvent.click(active.getByRole("button", { name: "Devolver" }));
        expect(library.returnLoan).toHaveBeenCalledWith("l1");
    });

    it("muestra el mensaje cuando la devolución falla", async () => {
        const library = renderPage({
            loans: [loan("l1", 5)],
            returnLoan: vi.fn().mockResolvedValue({
                ok: false,
                error: "No se pudo devolver el préstamo.",
            }),
        });
        const active = within(screen.getByRole("region", { name: "Préstamos activos" }));

        await userEvent.click(active.getByRole("button", { name: "Devolver" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo devolver el préstamo."
        );
        expect(library.returnLoan).toHaveBeenCalledWith("l1");
    });

    it("muestra reservas cumplidas y permite cancelar pendientes", async () => {
        const library = renderPage({
            reservations: [reservation("r1", "fulfilled"), reservation("r2", "pending")],
        });
        const reservations = within(screen.getByRole("region", { name: "Reservas" }));

        expect(reservations.getByText("Disponible para ti")).toBeInTheDocument();
        await userEvent.click(reservations.getByRole("button", { name: "Cancelar" }));
        expect(library.cancelReservation).toHaveBeenCalledWith("r2");
    });

    it("muestra el historial con préstamos devueltos", () => {
        renderPage({ loans: [loan("old", 0, { status: "returned" })] });

        const history = within(screen.getByRole("region", { name: "Historial de préstamos" }));
        expect(history.getByText("Libro old")).toBeInTheDocument();
        expect(history.getByText("Devuelto")).toBeInTheDocument();
    });

    it("muestra estados vacíos sin préstamos ni reservas", () => {
        renderPage();

        expect(screen.getByText("No tienes préstamos activos.")).toBeInTheDocument();
        expect(screen.getByText("No tienes reservas.")).toBeInTheDocument();
        expect(screen.getByText("Todavía no has devuelto préstamos.")).toBeInTheDocument();
    });
});
