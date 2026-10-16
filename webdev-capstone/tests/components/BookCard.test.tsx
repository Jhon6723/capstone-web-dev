import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BookCard from "../../src/components/books/BookCard";
import type { Book } from "../../src/types/book";
import { makeBook } from "../helpers";

function renderCard(
    book: Book,
    view: "grid" | "list" = "grid",
    availability?: "available" | "unavailable"
) {
    render(
        <MemoryRouter>
            <ul>
                <BookCard book={book} view={view} availability={availability} />
            </ul>
        </MemoryRouter>
    );
}

describe("BookCard", () => {
    it("muestra título, autores y año del libro", () => {
        renderCard(makeBook());

        expect(screen.getByText("El libro")).toBeInTheDocument();
        expect(screen.getByText("Autora Uno, Autor Dos")).toBeInTheDocument();
        expect(screen.getByText("1990")).toBeInTheDocument();
    });

    it("usa textos por defecto sin autores ni año", () => {
        renderCard(makeBook({ authors: [], firstPublishYear: undefined }));

        expect(screen.getByText("Autor desconocido")).toBeInTheDocument();
        expect(screen.getByText("Año desconocido")).toBeInTheDocument();
    });

    it.each(["grid", "list"] as const)("enlaza al detalle sin prefijo en vista %s", (view) => {
        renderCard(makeBook(), view);

        expect(screen.getByRole("link", { name: "Ver detalle" })).toHaveAttribute(
            "href",
            "/books/OL1W"
        );
    });

    it("marca Prestado cuando no está disponible", () => {
        renderCard(makeBook(), "grid", "unavailable");

        expect(screen.getByText("Prestado")).toBeInTheDocument();
        expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
    });

    it("marca Disponible cuando está disponible", () => {
        renderCard(makeBook(), "grid", "available");

        expect(screen.getByText("Disponible")).toBeInTheDocument();
        expect(screen.queryByText("Prestado")).not.toBeInTheDocument();
    });

    it("no muestra badge cuando la disponibilidad se desconoce", () => {
        renderCard(makeBook());

        expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
        expect(screen.queryByText("Prestado")).not.toBeInTheDocument();
    });

    it("muestra la portada con carga diferida", () => {
        renderCard(makeBook());

        const img = screen.getByRole("img", { name: "Portada de El libro" });
        expect(img).toHaveAttribute("loading", "lazy");
    });

    it("no muestra imagen cuando no hay portada", () => {
        renderCard(makeBook({ coverId: undefined }));

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});
