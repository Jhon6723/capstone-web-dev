import type { PostgrestError } from "@supabase/supabase-js";
import type {
    BookRef,
    LibraryEntry,
    Loan,
    LoanStatus,
    ReadingStatus,
    Reservation,
    ReservationStatus,
} from "../../types/library";
import { supabase } from "./client";

interface BookSnapshotRow {
    work_key: string;
    edition_key: string | null;
    title: string;
    authors: string[];
    cover_id: number | null;
    first_publish_year: number | null;
}

interface LoanRow extends BookSnapshotRow {
    id: string;
    borrowed_at: string;
    due_at: string;
    returned_at: string | null;
    status: LoanStatus;
}

interface ReservationRow extends BookSnapshotRow {
    id: string;
    created_at: string;
    status: ReservationStatus;
    notified_at: string | null;
}

interface LibraryEntryRow extends BookSnapshotRow {
    status: ReadingStatus;
    updated_at: string;
}

function rowToBookRef(row: BookSnapshotRow): BookRef {
    return {
        workKey: row.work_key,
        ...(row.edition_key ? { editionKey: row.edition_key } : {}),
        title: row.title,
        authors: row.authors,
        ...(row.cover_id !== null ? { coverId: row.cover_id } : {}),
        ...(row.first_publish_year !== null
            ? { firstPublishYear: row.first_publish_year }
            : {}),
    };
}

function rowToLoan(row: LoanRow): Loan {
    return {
        id: row.id,
        book: rowToBookRef(row),
        borrowedAt: row.borrowed_at,
        dueAt: row.due_at,
        returnedAt: row.returned_at,
        status: row.status,
    };
}

function rowToReservation(row: ReservationRow): Reservation {
    return {
        id: row.id,
        book: rowToBookRef(row),
        createdAt: row.created_at,
        status: row.status,
        notifiedAt: row.notified_at,
    };
}

function rowToLibraryEntry(row: LibraryEntryRow): LibraryEntry {
    return {
        book: rowToBookRef(row),
        status: row.status,
        updatedAt: row.updated_at,
    };
}

function bookSnapshot(userId: string, book: BookRef) {
    return {
        user_id: userId,
        work_key: book.workKey,
        ...(book.editionKey ? { edition_key: book.editionKey } : {}),
        title: book.title,
        authors: book.authors,
        ...(book.coverId !== undefined ? { cover_id: book.coverId } : {}),
        ...(book.firstPublishYear !== undefined
            ? { first_publish_year: book.firstPublishYear }
            : {}),
    };
}

const DEFAULT_ERROR = "No se pudo completar la operación. Intenta de nuevo.";

function mapLoanError(error: PostgrestError): string {
    if (error.code === "23505") return "Este libro ya está prestado.";
    return DEFAULT_ERROR;
}

function mapReservationError(error: PostgrestError): string {
    if (error.code === "23505") return "Ya tienes una reserva pendiente de este libro.";
    if (error.code === "42501") return "Solo puedes reservar libros prestados por otro usuario.";
    return DEFAULT_ERROR;
}

function fail(message: string): never {
    throw new Error(message);
}

export async function fetchLoans(userId: string): Promise<Loan[]> {
    const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .order("borrowed_at", { ascending: false });
    if (error) fail(DEFAULT_ERROR);
    return (data as LoanRow[]).map(rowToLoan);
}

export async function borrowBook(userId: string, book: BookRef): Promise<void> {
    const { error } = await supabase.from("loans").insert(bookSnapshot(userId, book));
    if (error) fail(mapLoanError(error));
}

export async function returnLoan(loanId: string): Promise<void> {
    const { error } = await supabase.rpc("return_loan", { loan_id: loanId });
    if (error) fail("No se pudo devolver el préstamo.");
}

export async function fetchReservations(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) fail(DEFAULT_ERROR);
    return (data as ReservationRow[]).map(rowToReservation);
}

export async function reserveBook(userId: string, book: BookRef): Promise<void> {
    const { error } = await supabase
        .from("reservations")
        .insert(bookSnapshot(userId, book));
    if (error) fail(mapReservationError(error));
}

export async function cancelReservation(reservationId: string): Promise<void> {
    const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservationId);
    if (error) fail(DEFAULT_ERROR);
}

export async function fetchLibraryEntries(userId: string): Promise<LibraryEntry[]> {
    const { data, error } = await supabase
        .from("library_entries")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
    if (error) fail(DEFAULT_ERROR);
    return (data as LibraryEntryRow[]).map(rowToLibraryEntry);
}

export async function setReadingStatus(
    userId: string,
    book: BookRef,
    status: ReadingStatus
): Promise<void> {
    const { error } = await supabase.from("library_entries").upsert(
        {
            ...bookSnapshot(userId, book),
            status,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,work_key" }
    );
    if (error) fail(DEFAULT_ERROR);
}

export async function removeLibraryEntry(workKey: string): Promise<void> {
    const { error } = await supabase
        .from("library_entries")
        .delete()
        .eq("work_key", workKey);
    if (error) fail(DEFAULT_ERROR);
}

export async function fetchLoanedWorkKeys(keys: string[]): Promise<Set<string>> {
    if (keys.length === 0) return new Set();
    const { data, error } = await supabase.rpc("loaned_work_keys", { keys });
    if (error) fail(DEFAULT_ERROR);
    return new Set(data as string[]);
}
