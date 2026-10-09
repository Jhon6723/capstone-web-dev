import { createContext, useContext } from "react";
import type {
    BookRef,
    LibraryEntry,
    Loan,
    ReadingStatus,
    Reservation,
} from "../types/library";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type LibraryStatus = "idle" | "loading" | "ready" | "error";

export interface LibraryContextValue {
    status: LibraryStatus;
    loans: Loan[];
    reservations: Reservation[];
    entries: LibraryEntry[];
    reload: () => Promise<void>;
    borrow: (book: BookRef) => Promise<ActionResult>;
    returnLoan: (loanId: string) => Promise<ActionResult>;
    reserve: (book: BookRef) => Promise<ActionResult>;
    cancelReservation: (reservationId: string) => Promise<ActionResult>;
    setReadingStatus: (book: BookRef, status: ReadingStatus) => Promise<ActionResult>;
    removeEntry: (workKey: string) => Promise<ActionResult>;
    activeLoanFor: (workKey: string) => Loan | undefined;
    pendingReservationFor: (workKey: string) => Reservation | undefined;
    entryFor: (workKey: string) => LibraryEntry | undefined;
}

export const LibraryContext = createContext<LibraryContextValue | null>(null);

export function useLibrary(): LibraryContextValue {
    const ctx = useContext(LibraryContext);
    if (!ctx) throw new Error("useLibrary debe usarse dentro de LibraryProvider");
    return ctx;
}
