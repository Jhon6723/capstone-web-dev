import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryContext } from "../../src/contexts/library-context";
import CatalogPage from "../../src/pages/catalog/CatalogPage";
import { fetchTrending, searchBooks } from "../../src/services/open-library/books";
import type { Book } from "../../src/types/book";
import { makeBook, makeLibrary } from "../helpers";

vi.mock("../../src/services/open-library/books", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../src/services/open-library/books")>();
    return {
        ...actual,
        fetchTrending: vi.fn(),
        searchBooks: vi.fn(),
    };
});

vi.mock("../../src/hooks/useLoanedWorkKeys", () => ({
    useLoanedWorkKeys: vi.fn(() => ({ loaned: new Set(["OL2W"]), error: false })),
}));

const trendingMock = vi.mocked(fetchTrending);
const searchMock = vi.mocked(searchBooks);

const book1: Book = makeBook({
    workKey: "/works/OL1W",
    title: "Libro Uno",
    authors: ["Autora Uno"],
    coverId: 11,
    firstPublishYear: 1990,
});

const book2: Book = makeBook({
    workKey: "/works/OL2W",
    title: "Libro Dos",
    authors: ["Autor Dos"],
    coverId: 22,
    firstPublishYear: 2001,
});

function renderCatalog() {
    render(
        <LibraryContext.Provider value={makeLibrary()}>
            <MemoryRouter>
                <CatalogPage />
            </MemoryRouter>
        </LibraryContext.Provider>
    );
}

describe("CatalogPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        trendingMock.mockResolvedValue([book1, book2]);
        searchMock.mockResolvedValue({
            books: [book1],
            total: 1,
        });
    });

    it("carga los destacados y muestra la disponibilidad de cada libro", async () => {
        renderCatalog();

        expect(await screen.findByText("Libro Uno")).toBeInTheDocument();
        expect(screen.getByText("Libro Dos")).toBeInTheDocument();
        expect(trendingMock).toHaveBeenCalledTimes(1);

        const card1 = screen.getByText("Libro Uno").closest("li") as HTMLElement;
        const card2 = screen.getByText("Libro Dos").closest("li") as HTMLElement;
        expect(card1).toHaveTextContent("Disponible");
        expect(card2).toHaveTextContent("Prestado");
    });

    it("busca al pulsar Enter con los filtros por defecto", async () => {
        renderCatalog();
        await screen.findByText("Libro Uno");

        await userEvent.type(screen.getByLabelText("Buscar libros"), "dune{Enter}");

        await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1));
        expect(searchMock).toHaveBeenCalledWith(
            { query: "dune", subjects: [], sort: "relevance", page: 1 },
            expect.anything()
        );
    });

    it("espera a que termine de escribirse antes de buscar", async () => {
        renderCatalog();
        await screen.findByText("Libro Uno");

        await userEvent.type(screen.getByLabelText("Buscar libros"), "dune");
        expect(searchMock).not.toHaveBeenCalled();

        await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(searchMock).toHaveBeenCalledWith(
            { query: "dune", subjects: [], sort: "relevance", page: 1 },
            expect.anything()
        );
    });

    it("muestra el error del catálogo y permite reintentar", async () => {
        searchMock.mockRejectedValue(new Error("fallo"));
        renderCatalog();
        await screen.findByText("Libro Uno");

        await userEvent.type(screen.getByLabelText("Buscar libros"), "dune{Enter}");

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ocurrió un error al consultar el catálogo."
        );
        await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

        await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2));
    });

    it("muestra un estado vacío cuando la búsqueda no tiene resultados", async () => {
        searchMock.mockResolvedValue({ books: [], total: 0 });
        renderCatalog();
        await screen.findByText("Libro Uno");

        await userEvent.type(screen.getByLabelText("Buscar libros"), "xyz{Enter}");

        expect(await screen.findByText(/No se encontraron resultados/)).toBeInTheDocument();
    });
});
