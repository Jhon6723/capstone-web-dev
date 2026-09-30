export type EbookAccess = "public" | "borrowable" | "printdisabled" | "unclassified" | "no_ebook";

export interface SearchDoc {
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
    subject?: string[];
    ratings_average?: number;
    ebook_access?: EbookAccess;
}

export interface SearchResponse {
    numFound: number;
    start: number;
    docs: SearchDoc[];
}

export interface TrendingWork {
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
    ratings_average?: number;
    ebook_access?: EbookAccess;
}

export interface TrendingResponse {
    query: string;
    works: TrendingWork[];
}

export interface WorkAuthorRef {
    author: { key: string };
    type?: { key: string };
}

export interface WorkDetailResponse {
    key: string;
    title: string;
    description?: string | { type: string; value: string };
    subjects?: string[];
    covers?: number[];
    authors?: WorkAuthorRef[];
    first_publish_date?: string;
}

export interface AuthorResponse {
    name: string;
    personal_name?: string;
}
