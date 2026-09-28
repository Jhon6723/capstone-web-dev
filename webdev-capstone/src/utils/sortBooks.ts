import type { Book } from "../types/book";
import type { CatalogSort } from "../types/catalog";

export function sortBooks(books: Book[], sort: CatalogSort): Book[] {
    const sorted = [...books];
    switch (sort) {
        case "author-asc":
            sorted.sort((a, b) => (a.authors[0] ?? "").localeCompare(b.authors[0] ?? ""));
            break;
        case "title-asc":
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "newest":
            sorted.sort((a, b) => (b.firstPublishYear ?? 0) - (a.firstPublishYear ?? 0));
            break;
        case "rating":
            sorted.sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0));
            break;
    }
    return sorted;
}
