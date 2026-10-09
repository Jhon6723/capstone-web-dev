import type { Loan } from "../types/library";

const DAY_MS = 24 * 60 * 60 * 1000;

export function toWorkId(workKey: string): string {
    return workKey.replace(/^\/works\//, "");
}

export function isOverdue(loan: Loan, now: Date = new Date()): boolean {
    return loan.status === "active" && now.getTime() > new Date(loan.dueAt).getTime();
}

export function daysUntilDue(loan: Loan, now: Date = new Date()): number {
    return Math.ceil((new Date(loan.dueAt).getTime() - now.getTime()) / DAY_MS);
}

export function isDueSoon(loan: Loan, now: Date = new Date()): boolean {
    return loan.status === "active" && !isOverdue(loan, now) && daysUntilDue(loan, now) <= 3;
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
