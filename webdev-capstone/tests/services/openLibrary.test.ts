import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function jsonResponse(data: unknown, status = 200) {
    return Promise.resolve(
        new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" },
        })
    );
}

function searchResponse(docs: unknown[] = [], numFound = 0) {
    return jsonResponse({ numFound, start: 0, docs });
}

async function importBooks() {
    return await import("../../src/services/open-library/books");
}

async function importWorks() {
    return await import("../../src/services/open-library/works");
}

describe("searchBooks", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal("fetch", fetchMock);
        fetchMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("construye la consulta con categorías, orden y página", async () => {
        fetchMock.mockReturnValue(searchResponse());
        const { searchBooks } = await importBooks();

        await searchBooks({
            query: "  tolkien ",
            subjects: ["fantasy", "history"],
            sort: "newest",
            page: 2,
        });

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.searchParams.get("q")).toBe("tolkien (subject:fantasy OR subject:history)");
        expect(url.searchParams.get("sort")).toBe("new");
        expect(url.searchParams.get("page")).toBe("2");
        expect(url.searchParams.get("limit")).toBe("20");
    });

    it("usa una sola categoría sin paréntesis", async () => {
        fetchMock.mockReturnValue(searchResponse());
        const { searchBooks } = await importBooks();

        await searchBooks({ query: "tolkien", subjects: ["fantasy"], sort: "relevance", page: 1 });

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.searchParams.get("q")).toBe("tolkien subject:fantasy");
    });

    it("no envía parámetro sort cuando el orden no lo soporta el servidor", async () => {
        fetchMock.mockReturnValue(searchResponse());
        const { searchBooks } = await importBooks();

        await searchBooks({ query: "tolkien", subjects: [], sort: "title-asc", page: 1 });

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.searchParams.has("sort")).toBe(false);
    });

    it("mapea los documentos a libros y usa numFound como total", async () => {
        fetchMock.mockReturnValue(
            searchResponse(
                [
                    {
                        key: "/works/OL1W",
                        title: "Sin autor",
                        cover_i: 42,
                        first_publish_year: 1990,
                    },
                ],
                123
            )
        );
        const { searchBooks } = await importBooks();

        const result = await searchBooks({
            query: "x",
            subjects: [],
            sort: "relevance",
            page: 1,
        });

        expect(result.total).toBe(123);
        expect(result.books).toEqual([
            expect.objectContaining({
                workKey: "/works/OL1W",
                title: "Sin autor",
                authors: [],
                coverId: 42,
                firstPublishYear: 1990,
            }),
        ]);
    });

    it("rechaza con OpenLibraryError cuando la API falla", async () => {
        fetchMock.mockReturnValue(jsonResponse({}, 503));
        const { searchBooks } = await importBooks();
        const { OpenLibraryError } = await import("../../src/services/open-library/client");

        const promise = searchBooks({ query: "x", subjects: [], sort: "relevance", page: 1 });
        await expect(promise).rejects.toBeInstanceOf(OpenLibraryError);
        await expect(promise).rejects.toMatchObject({ status: 503 });
    });

    it("sirve una segunda llamada idéntica desde la caché", async () => {
        fetchMock.mockReturnValue(searchResponse([], 5));
        const { searchBooks } = await importBooks();
        const params = { query: "x", subjects: [], sort: "relevance" as const, page: 1 };

        await searchBooks(params);
        await searchBooks(params);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe("coverImageUrl", () => {
    it("devuelve null sin coverId", async () => {
        const { coverImageUrl } = await importBooks();
        expect(coverImageUrl(undefined, "M")).toBeNull();
    });

    it("construye la URL de la portada", async () => {
        const { coverImageUrl } = await importBooks();
        expect(coverImageUrl(42, "L")).toBe("https://covers.openlibrary.org/b/id/42-L.jpg");
    });
});

describe("fetchWork", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal("fetch", fetchMock);
        fetchMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("normaliza descripción, año, portada y autores tolerando fallos", async () => {
        fetchMock.mockImplementation((url: string) => {
            if (url.includes("/works/OL1W.json")) {
                return jsonResponse({
                    key: "/works/OL1W",
                    title: "El libro",
                    description: { type: "/type/text", value: "Una descripción" },
                    subjects: ["fantasy"],
                    covers: [-1, 42],
                    first_publish_date: "June 1954",
                    authors: [
                        { author: { key: "/authors/OL1A" } },
                        { author: { key: "/authors/OL2A" } },
                    ],
                });
            }
            if (url.includes("/authors/OL1A.json")) {
                return jsonResponse({ name: "Autora Uno" });
            }
            return jsonResponse({}, 404);
        });
        const { fetchWork } = await importWorks();

        const detail = await fetchWork("OL1W");

        expect(detail.description).toBe("Una descripción");
        expect(detail.firstPublishYear).toBe(1954);
        expect(detail.coverId).toBe(42);
        expect(detail.authors).toEqual(["Autora Uno"]);
    });
});
