import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as libraryService from "../services/supabase/library";
import type { LibraryEntry, Loan, ReadingStatus, Reservation } from "../types/library";
import { toWorkId } from "../utils/loans";
import { useAuth } from "./auth-context";
import type { ActionResult, LibraryContextValue, LibraryStatus } from "./library-context";
import { LibraryContext } from "./library-context";

const NOT_AUTHENTICATED: ActionResult = {
    ok: false,
    error: "Debes iniciar sesión para continuar.",
};

function toActionResult(error: unknown): ActionResult {
    return {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo completar la operación. Intenta de nuevo.",
    };
}

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [status, setStatus] = useState<LibraryStatus>("idle");
    const [loans, setLoans] = useState<Loan[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [entries, setEntries] = useState<LibraryEntry[]>([]);
    const loadIdRef = useRef(0);

    const reload = useCallback(async () => {
        if (!userId) {
            setStatus("idle");
            setLoans([]);
            setReservations([]);
            setEntries([]);
            return;
        }
        const loadId = ++loadIdRef.current;
        setStatus("loading");
        try {
            const [nextLoans, nextReservations, nextEntries] = await Promise.all([
                libraryService.fetchLoans(userId),
                libraryService.fetchReservations(userId),
                libraryService.fetchLibraryEntries(userId),
            ]);
            if (loadId !== loadIdRef.current) return;
            setLoans(nextLoans);
            setReservations(nextReservations);
            setEntries(nextEntries);
            setStatus("ready");
        } catch {
            if (loadId !== loadIdRef.current) return;
            setStatus("error");
        }
    }, [userId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            void reload();
        }, 0);
        return () => clearTimeout(timeout);
    }, [reload]);

    const value = useMemo<LibraryContextValue>(() => {
        const run = async (
            action: () => Promise<void>,
            refreshLists: Array<"loans" | "reservations" | "entries">
        ): Promise<ActionResult> => {
            if (!userId) return NOT_AUTHENTICATED;
            try {
                await action();
                const [nextLoans, nextReservations, nextEntries] = await Promise.all([
                    refreshLists.includes("loans")
                        ? libraryService.fetchLoans(userId)
                        : Promise.resolve(null),
                    refreshLists.includes("reservations")
                        ? libraryService.fetchReservations(userId)
                        : Promise.resolve(null),
                    refreshLists.includes("entries")
                        ? libraryService.fetchLibraryEntries(userId)
                        : Promise.resolve(null),
                ]);
                if (nextLoans) setLoans(nextLoans);
                if (nextReservations) setReservations(nextReservations);
                if (nextEntries) setEntries(nextEntries);
                return { ok: true };
            } catch (error) {
                return toActionResult(error);
            }
        };
        return {
            status,
            loans,
            reservations,
            entries,
            reload,
            borrow: (book) =>
                run(() => libraryService.borrowBook(userId as string, book), ["loans"]),
            returnLoan: (loanId) =>
                run(() => libraryService.returnLoan(loanId), ["loans", "reservations"]),
            reserve: (book) =>
                run(() => libraryService.reserveBook(userId as string, book), ["reservations"]),
            cancelReservation: (reservationId) =>
                run(() => libraryService.cancelReservation(reservationId), ["reservations"]),
            setReadingStatus: (book, status: ReadingStatus) =>
                run(() => libraryService.setReadingStatus(userId as string, book, status), [
                    "entries",
                ]),
            removeEntry: (workKey) =>
                run(() => libraryService.removeLibraryEntry(workKey), ["entries"]),
            activeLoanFor: (workKey) => {
                const id = toWorkId(workKey);
                return loans.find(
                    (loan) => loan.status === "active" && toWorkId(loan.book.workKey) === id
                );
            },
            pendingReservationFor: (workKey) => {
                const id = toWorkId(workKey);
                return reservations.find(
                    (reservation) =>
                        reservation.status === "pending" &&
                        toWorkId(reservation.book.workKey) === id
                );
            },
            entryFor: (workKey) => {
                const id = toWorkId(workKey);
                return entries.find((entry) => toWorkId(entry.book.workKey) === id);
            },
        };
    }, [status, loans, reservations, entries, reload, userId]);

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};
