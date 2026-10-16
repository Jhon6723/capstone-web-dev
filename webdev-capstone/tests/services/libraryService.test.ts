import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BookRef } from "../../src/types/library";

const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("../../src/services/supabase/client", () => ({
    supabase: { from: fromMock, rpc: rpcMock },
}));

interface BuilderResult {
    data?: unknown;
    error?: unknown;
}

interface Builder {
    [key: string]: unknown;
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    then: (resolve: (value: BuilderResult) => unknown) => Promise<unknown>;
}

function makeBuilder(result: BuilderResult): Builder {
    const builder = {} as Builder;
    for (const method of ["select", "eq", "order", "insert", "update", "delete", "upsert"]) {
        builder[method] = vi.fn(() => builder);
    }
    builder.then = (resolve) => Promise.resolve(result).then(resolve);
    return builder;
}

const book: BookRef = {
    workKey: "OL1W",
    title: "El libro",
    authors: ["Autora Uno"],
    coverId: 42,
    firstPublishYear: 1990,
};

const loanRow = {
    id: "l1",
    user_id: "u1",
    work_key: "OL1W",
    edition_key: null,
    title: "El libro",
    authors: ["Autora Uno"],
    cover_id: null,
    first_publish_year: 1990,
    borrowed_at: "2026-01-01T00:00:00Z",
    due_at: "2026-01-15T00:00:00Z",
    returned_at: null,
    status: "active",
};

async function loadService() {
    return await import("../../src/services/supabase/library");
}

describe("library service", () => {
    beforeEach(() => {
        vi.resetModules();
        fromMock.mockReset();
        rpcMock.mockReset();
    });

    it("fetchLoans consulta la tabla y mapea las filas a préstamos", async () => {
        const builder = makeBuilder({ data: [loanRow], error: null });
        fromMock.mockReturnValue(builder);
        const { fetchLoans } = await loadService();

        const loans = await fetchLoans("u1");

        expect(fromMock).toHaveBeenCalledWith("loans");
        expect(builder.select).toHaveBeenCalledWith("*");
        expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
        expect(builder.order).toHaveBeenCalledWith("borrowed_at", { ascending: false });
        expect(loans).toEqual([
            {
                id: "l1",
                book: {
                    workKey: "OL1W",
                    title: "El libro",
                    authors: ["Autora Uno"],
                    firstPublishYear: 1990,
                },
                borrowedAt: "2026-01-01T00:00:00Z",
                dueAt: "2026-01-15T00:00:00Z",
                returnedAt: null,
                status: "active",
            },
        ]);
    });

    it("borrowBook inserta solo el snapshot sin columnas vacías", async () => {
        const builder = makeBuilder({ data: null, error: null });
        fromMock.mockReturnValue(builder);
        const { borrowBook } = await loadService();

        await borrowBook("u1", { workKey: "OL1W", title: "El libro", authors: ["Autora Uno"] });

        expect(builder.insert).toHaveBeenCalledWith({
            user_id: "u1",
            work_key: "OL1W",
            title: "El libro",
            authors: ["Autora Uno"],
        });
    });

    it("borrowBook traduce un libro ya prestado", async () => {
        const builder = makeBuilder({ data: null, error: { code: "23505" } });
        fromMock.mockReturnValue(builder);
        const { borrowBook } = await loadService();

        await expect(borrowBook("u1", book)).rejects.toThrow("Este libro ya está prestado.");
    });

    it("borrowBook usa el mensaje genérico para otros errores", async () => {
        const builder = makeBuilder({ data: null, error: { code: "00000" } });
        fromMock.mockReturnValue(builder);
        const { borrowBook } = await loadService();

        await expect(borrowBook("u1", book)).rejects.toThrow(
            "No se pudo completar la operación. Intenta de nuevo."
        );
    });

    it("reserveBook traduce una reserva duplicada", async () => {
        const builder = makeBuilder({ data: null, error: { code: "23505" } });
        fromMock.mockReturnValue(builder);
        const { reserveBook } = await loadService();

        await expect(reserveBook("u1", book)).rejects.toThrow(
            "Ya tienes una reserva pendiente de este libro."
        );
    });

    it("reserveBook traduce reservar un libro que no está prestado por otro", async () => {
        const builder = makeBuilder({ data: null, error: { code: "42501" } });
        fromMock.mockReturnValue(builder);
        const { reserveBook } = await loadService();

        await expect(reserveBook("u1", book)).rejects.toThrow(
            "Solo puedes reservar libros prestados por otro usuario."
        );
    });

    it("returnLoan invoca la función RPC con el id del préstamo", async () => {
        rpcMock.mockResolvedValue({ data: null, error: null });
        const { returnLoan } = await loadService();

        await returnLoan("l1");

        expect(rpcMock).toHaveBeenCalledWith("return_loan", { loan_id: "l1" });
    });

    it("returnLoan traduce el error de la RPC", async () => {
        rpcMock.mockResolvedValue({ data: null, error: { message: "loan_not_returnable" } });
        const { returnLoan } = await loadService();

        await expect(returnLoan("l1")).rejects.toThrow("No se pudo devolver el préstamo.");
    });

    it("fetchLoanedWorkKeys no llama a la RPC sin claves", async () => {
        const { fetchLoanedWorkKeys } = await loadService();

        const result = await fetchLoanedWorkKeys([]);

        expect(result).toEqual(new Set());
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it("fetchLoanedWorkKeys devuelve un Set con las claves prestadas", async () => {
        rpcMock.mockResolvedValue({ data: ["OL1W"], error: null });
        const { fetchLoanedWorkKeys } = await loadService();

        const result = await fetchLoanedWorkKeys(["OL1W", "OL2W"]);

        expect(rpcMock).toHaveBeenCalledWith("loaned_work_keys", { keys: ["OL1W", "OL2W"] });
        expect(result).toEqual(new Set(["OL1W"]));
    });
});
