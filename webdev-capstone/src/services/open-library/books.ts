import type { Book, BookAvailability } from "../../types/book";
import type { CatalogSort } from "../../types/catalog";
import type {
    EbookAccess,
    SearchDoc,
    SearchResponse,
    TrendingResponse,
    TrendingWork
} from "../../types/openLibrary";
import { fetchJson } from "./client";

export const PAGE_SIZE = 20;
const TRENDING_LIMIT = 100;
const SEARCH_FIELDS =
    "key,title,author_name,cover_i,first_publish_year,subject,ratings_average,ebook_access";

const SERVER_SORTS: Partial<Record<CatalogSort, string>> = {
    newest: "new",
    rating: "rating",
};

const AVAILABLE_ACCESS: EbookAccess[] = ["borrowable", "public"];

export interface SearchParams {
    query: string;
    subjects: string[];
    sort: CatalogSort;
    page: number;
}

export interface PagedBooks {
    books: Book[];
    total: number;
}

export type CoverSize = "S" | "M" | "L";

export function coverImageUrl(coverId: number | undefined, size: CoverSize): string | null {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function mapWork(doc: SearchDoc | TrendingWork): Book {
    const availability: BookAvailability =
        doc.ebook_access && AVAILABLE_ACCESS.includes(doc.ebook_access)
            ? "available"
            : "unavailable";
    return {
        workKey: doc.key,
        title: doc.title,
        authors: doc.author_name ?? [],
        coverId: doc.cover_i,
        firstPublishYear: doc.first_publish_year,
        subjects: "subject" in doc ? (doc.subject ?? []) : [],
        ratingsAverage: doc.ratings_average,
        availability,
    };
}

function buildQuery(text: string, subjects: string[]): string {
    const clause =
        subjects.length === 0
            ? ""
            : subjects.length === 1
              ? `subject:${subjects[0]}`
              : `(${subjects.map((subject) => `subject:${subject}`).join(" OR ")})`;
    return [text.trim(), clause].filter(Boolean).join(" ");
}

export async function searchBooks(params: SearchParams, signal?: AbortSignal): Promise<PagedBooks> {
    const search = new URLSearchParams({
        q: buildQuery(params.query, params.subjects),
        fields: SEARCH_FIELDS,
        limit: String(PAGE_SIZE),
        page: String(params.page),
    });
    const serverSort = SERVER_SORTS[params.sort];
    if (serverSort) search.set("sort", serverSort);
    const data = await fetchJson<SearchResponse>(`/search.json?${search}`, signal);
    return { books: data.docs.map(mapWork), total: data.numFound };
}

export async function fetchTrending(signal?: AbortSignal): Promise<Book[]> {
    const data = await fetchJson<TrendingResponse>(
        `/trending/daily.json?limit=${TRENDING_LIMIT}`,
        signal
    );
    return data.works.map(mapWork);
}
