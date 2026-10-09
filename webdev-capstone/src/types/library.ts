export interface BookRef {
    workKey: string;
    editionKey?: string;
    title: string;
    authors: string[];
    coverId?: number;
    firstPublishYear?: number;
}

export type LoanStatus = "active" | "returned";

export interface Loan {
    id: string;
    book: BookRef;
    borrowedAt: string;
    dueAt: string;
    returnedAt: string | null;
    status: LoanStatus;
}

export type ReservationStatus = "pending" | "fulfilled" | "cancelled";

export interface Reservation {
    id: string;
    book: BookRef;
    createdAt: string;
    status: ReservationStatus;
    notifiedAt: string | null;
}

export type ReadingStatus = "reading" | "completed" | "wishlist";

export interface LibraryEntry {
    book: BookRef;
    status: ReadingStatus;
    updatedAt: string;
}
