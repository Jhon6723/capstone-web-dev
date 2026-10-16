import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../../src/contexts/auth-context";
import { useLibrary } from "../../src/contexts/library-context";
import { LibraryProvider } from "../../src/contexts/LibraryContext";
import {
    borrowBook,
    fetchLibraryEntries,
    fetchLoans,
    fetchReservations,
    returnLoan,
} from "../../src/services/supabase/library";
import type { Loan } from "../../src/types/library";
import { makeAuth, makeLoan, testUser } from "../helpers";

vi.mock("../../src/services/supabase/library", () => ({
    fetchLoans: vi.fn(),
    fetchReservations: vi.fn(),
    fetchLibraryEntries: vi.fn(),
    borrowBook: vi.fn(),
    returnLoan: vi.fn(),
    reserveBook: vi.fn(),
    cancelReservation: vi.fn(),
    setReadingStatus: vi.fn(),
    removeLibraryEntry: vi.fn(),
    fetchLoanedWorkKeys: vi.fn(),
}));

const fetchLoansMock = vi.mocked(fetchLoans);
const fetchReservationsMock = vi.mocked(fetchReservations);
const fetchEntriesMock = vi.mocked(fetchLibraryEntries);
const returnLoanMock = vi.mocked(returnLoan);
const borrowMock = vi.mocked(borrowBook);

const loan: Loan = makeLoan();

function wrapperFor(auth: AuthContextValue) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <AuthContext.Provider value={auth}>
                <LibraryProvider>{children}</LibraryProvider>
            </AuthContext.Provider>
        );
    };
}

describe("LibraryContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchLoansMock.mockResolvedValue([loan]);
        fetchReservationsMock.mockResolvedValue([]);
        fetchEntriesMock.mockResolvedValue([]);
    });

    it("permanece en idle sin usuario y no consulta el servicio", async () => {
        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth({ user: null })),
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
        });
        expect(result.current.status).toBe("idle");
        expect(fetchLoansMock).not.toHaveBeenCalled();
    });

    it("carga préstamos, reservas y biblioteca cuando hay usuario", async () => {
        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });

        await waitFor(() => expect(result.current.status).toBe("ready"));
        expect(fetchLoansMock).toHaveBeenCalledWith(testUser.id);
        expect(fetchReservationsMock).toHaveBeenCalledWith(testUser.id);
        expect(fetchEntriesMock).toHaveBeenCalledWith(testUser.id);
        expect(result.current.loans).toEqual([loan]);
    });

    it("pasa a error cuando la carga falla", async () => {
        fetchLoansMock.mockRejectedValue(new Error("fallo"));

        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });

        await waitFor(() => expect(result.current.status).toBe("error"));
    });

    it("devolver un préstamo recarga préstamos y reservas, no la biblioteca", async () => {
        returnLoanMock.mockResolvedValue(undefined);
        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });
        await waitFor(() => expect(result.current.status).toBe("ready"));
        fetchLoansMock.mockClear();
        fetchReservationsMock.mockClear();
        fetchEntriesMock.mockClear();

        let actionResult: unknown;
        await act(async () => {
            actionResult = await result.current.returnLoan("l1");
        });

        expect(returnLoanMock).toHaveBeenCalledWith("l1");
        expect(fetchLoansMock).toHaveBeenCalledTimes(1);
        expect(fetchReservationsMock).toHaveBeenCalledTimes(1);
        expect(fetchEntriesMock).not.toHaveBeenCalled();
        expect(actionResult).toEqual({ ok: true });
    });

    it("expone el mensaje del servicio cuando la acción falla", async () => {
        borrowMock.mockRejectedValue(new Error("Este libro ya está prestado."));
        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });
        await waitFor(() => expect(result.current.status).toBe("ready"));

        let actionResult: unknown;
        await act(async () => {
            actionResult = await result.current.borrow(loan.book);
        });

        expect(actionResult).toEqual({ ok: false, error: "Este libro ya está prestado." });
    });

    it("activeLoanFor encuentra préstamos activos aunque la clave tenga prefijo", async () => {
        const returned = { ...loan, id: "l2", status: "returned" as const };
        fetchLoansMock.mockResolvedValue([loan, returned]);
        const { result } = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });
        await waitFor(() => expect(result.current.status).toBe("ready"));

        expect(result.current.activeLoanFor("/works/OL1W")).toEqual(loan);

        fetchLoansMock.mockResolvedValue([returned]);
        const only = renderHook(() => useLibrary(), {
            wrapper: wrapperFor(makeAuth()),
        });
        await waitFor(() => expect(only.result.current.status).toBe("ready"));
        expect(only.result.current.activeLoanFor("OL1W")).toBeUndefined();
    });
});
