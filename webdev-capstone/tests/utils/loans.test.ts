import { describe, expect, it } from "vitest";
import { daysUntilDue, isDueSoon, isOverdue, toWorkId } from "../../src/utils/loans";
import { makeLoan } from "../helpers";

const NOW = new Date("2026-01-10T12:00:00Z");

describe("toWorkId", () => {
    it("quita el prefijo /works/ de la clave", () => {
        expect(toWorkId("/works/OL1W")).toBe("OL1W");
    });

    it("deja igual una clave sin prefijo", () => {
        expect(toWorkId("OL1W")).toBe("OL1W");
    });
});

describe("isOverdue", () => {
    it("es vencido cuando un préstamo activo superó su fecha límite", () => {
        const loan = makeLoan({ dueAt: "2026-01-09T12:00:00Z" });
        expect(isOverdue(loan, NOW)).toBe(true);
    });

    it("no es vencido cuando el préstamo activo aún tiene plazo", () => {
        const loan = makeLoan({ dueAt: "2026-01-15T12:00:00Z" });
        expect(isOverdue(loan, NOW)).toBe(false);
    });

    it("no es vencido cuando el préstamo ya fue devuelto", () => {
        const loan = makeLoan({
            dueAt: "2026-01-09T12:00:00Z",
            returnedAt: "2026-01-08T12:00:00Z",
            status: "returned",
        });
        expect(isOverdue(loan, NOW)).toBe(false);
    });
});

describe("daysUntilDue", () => {
    it("redondea hacia arriba los días restantes", () => {
        const loan = makeLoan({ dueAt: "2026-01-12T00:00:00Z" });
        expect(daysUntilDue(loan, NOW)).toBe(2);
    });

    it("devuelve 0 cuando vence en el instante actual", () => {
        const loan = makeLoan({ dueAt: "2026-01-10T12:00:00Z" });
        expect(daysUntilDue(loan, NOW)).toBe(0);
    });

    it("devuelve negativo cuando ya pasó la fecha", () => {
        const loan = makeLoan({ dueAt: "2026-01-09T12:00:00Z" });
        expect(daysUntilDue(loan, NOW)).toBe(-1);
    });
});

describe("isDueSoon", () => {
    it("vence pronto cuando quedan 3 días o menos", () => {
        const loan = makeLoan({ dueAt: "2026-01-13T12:00:00Z" });
        expect(isDueSoon(loan, NOW)).toBe(true);
    });

    it("no vence pronto cuando quedan más de 3 días", () => {
        const loan = makeLoan({ dueAt: "2026-01-14T12:00:00Z" });
        expect(isDueSoon(loan, NOW)).toBe(false);
    });

    it("no vence pronto cuando ya está vencido", () => {
        const loan = makeLoan({ dueAt: "2026-01-09T12:00:00Z" });
        expect(isDueSoon(loan, NOW)).toBe(false);
    });

    it("no vence pronto cuando el préstamo fue devuelto", () => {
        const loan = makeLoan({
            dueAt: "2026-01-11T12:00:00Z",
            returnedAt: "2026-01-10T00:00:00Z",
            status: "returned",
        });
        expect(isDueSoon(loan, NOW)).toBe(false);
    });
});
