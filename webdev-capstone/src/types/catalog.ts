export type CatalogSort = "relevance" | "author-asc" | "newest" | "rating" | "title-asc";

export type CatalogView = "grid" | "list";

export type CatalogStatus = "loading" | "success" | "error";

export interface CatalogCategory {
    label: string;
    subject: string;
}
