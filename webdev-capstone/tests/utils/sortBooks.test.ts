import { describe, expect, it } from "vitest";
import type { Book } from "../../src/types/book";
import { sortBooks } from "../../src/utils/sortBooks";
import { makeBook } from "../helpers";

const books: Book[] = [
    makeBook({
        workKey: "a",
        title: "Zorro",
        authors: ["Vega"],
        firstPublishYear: 1990,
        ratingsAverage: 4,
    }),
    makeBook({ workKey: "b", title: "Álamo", authors: ["Pérez"], firstPublishYear: 2001 }),
    makeBook({
        workKey: "c",
        title: "Marea",
        authors: ["Díaz"],
        firstPublishYear: undefined,
        ratingsAverage: 2,
    }),
];

describe("sortBooks", () => {
    it("ordena por título ascendente", () => {
        expect(sortBooks(books, "title-asc").map((b) => b.workKey)).toEqual(["b", "c", "a"]);
    });

    it("ordena por autor ascendente", () => {
        expect(sortBooks(books, "author-asc").map((b) => b.workKey)).toEqual(["c", "b", "a"]);
    });

    it("ordena por año más reciente y deja último el que no tiene año", () => {
        expect(sortBooks(books, "newest").map((b) => b.workKey)).toEqual(["b", "a", "c"]);
    });

    it("ordena por calificación y deja último el que no tiene rating", () => {
        expect(sortBooks(books, "rating").map((b) => b.workKey)).toEqual(["a", "c", "b"]);
    });

    it("mantiene el orden original con relevancia", () => {
        expect(sortBooks(books, "relevance").map((b) => b.workKey)).toEqual(["a", "b", "c"]);
    });

    it("no muta el arreglo de entrada", () => {
        const original = books.map((b) => b.workKey);
        sortBooks(books, "title-asc");
        expect(books.map((b) => b.workKey)).toEqual(original);
    });
});
