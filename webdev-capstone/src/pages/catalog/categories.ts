import type { CatalogCategory, CatalogSort } from "../../types/catalog";

export const CATEGORIES: CatalogCategory[] = [
    { label: "Ficción", subject: "fiction" },
    { label: "Ciencia", subject: "science" },
    { label: "Historia", subject: "history" },
    { label: "Tecnología", subject: "technology" },
    { label: "Arte", subject: "art" },
    { label: "Derecho", subject: "law" },
];

export const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
    { value: "relevance", label: "Relevancia" },
    { value: "author-asc", label: "Autor A-Z" },
    { value: "newest", label: "Fecha reciente" },
    { value: "rating", label: "Popularidad" },
    { value: "title-asc", label: "Título A-Z" },
];
