import { vi } from "vitest";
import type { AuthContextValue } from "../src/contexts/auth-context";
import type { LibraryContextValue } from "../src/contexts/library-context";
import type { PublicUser } from "../src/types/auth";
import type { Book } from "../src/types/book";
import type { Loan, Reservation } from "../src/types/library";

export const testUser: PublicUser = {
    id: "u1",
    name: "Ana",
    email: "ana@correo.com",
    createdAt: "2026-01-01T00:00:00Z",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysFromNow(days: number): string {
    return new Date(Date.now() + days * DAY_MS).toISOString();
}

export function makeBook(overrides: Partial<Book> = {}): Book {
    return {
        workKey: "/works/OL1W",
        title: "El libro",
        authors: ["Autora Uno", "Autor Dos"],
        coverId: 42,
        firstPublishYear: 1990,
        subjects: [],
        ...overrides,
    };
}

export function makeLoan(overrides: Partial<Loan> = {}): Loan {
    return {
        id: "l1",
        book: { workKey: "OL1W", title: "El libro", authors: [] },
        borrowedAt: "2026-01-01T00:00:00Z",
        dueAt: "2026-01-15T00:00:00Z",
        returnedAt: null,
        status: "active",
        ...overrides,
    };
}

export function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
    return {
        id: "r1",
        book: { workKey: "OL1W", title: "El libro", authors: [] },
        createdAt: "2026-01-01T00:00:00Z",
        status: "pending",
        notifiedAt: null,
        ...overrides,
    };
}

export function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
    return {
        user: testUser,
        loading: false,
        login: vi.fn().mockResolvedValue({ ok: true }),
        register: vi.fn().mockResolvedValue({ ok: true }),
        logout: vi.fn(),
        ...overrides,
    };
}

export function makeLibrary(overrides: Partial<LibraryContextValue> = {}): LibraryContextValue {
    return {
        status: "ready",
        loans: [],
        reservations: [],
        entries: [],
        reload: vi.fn().mockResolvedValue(undefined),
        borrow: vi.fn().mockResolvedValue({ ok: true }),
        returnLoan: vi.fn().mockResolvedValue({ ok: true }),
        reserve: vi.fn().mockResolvedValue({ ok: true }),
        cancelReservation: vi.fn().mockResolvedValue({ ok: true }),
        setReadingStatus: vi.fn().mockResolvedValue({ ok: true }),
        removeEntry: vi.fn().mockResolvedValue({ ok: true }),
        activeLoanFor: vi.fn(() => undefined),
        pendingReservationFor: vi.fn(() => undefined),
        entryFor: vi.fn(() => undefined),
        ...overrides,
    };
}

export function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
