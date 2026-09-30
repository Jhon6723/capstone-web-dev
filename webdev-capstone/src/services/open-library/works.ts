import type { AuthorResponse, WorkAuthorRef, WorkDetailResponse } from "../../types/openLibrary";
import { fetchJson } from "./client";

const MAX_AUTHORS = 5;

export interface WorkDetails {
    title: string;
    authors: string[];
    description?: string;
    subjects: string[];
    coverId?: number;
    firstPublishYear?: number;
}

function normalizeDescription(
    description: WorkDetailResponse["description"]
): string | undefined {
    if (!description) return undefined;
    return typeof description === "string" ? description : description.value;
}

function parseYear(date: string | undefined): number | undefined {
    const match = date?.match(/\d{4}/);
    return match ? Number(match[0]) : undefined;
}

async function fetchAuthorNames(
    refs: WorkAuthorRef[] | undefined,
    signal?: AbortSignal
): Promise<string[]> {
    if (!refs?.length) return [];
    const results = await Promise.allSettled(
        refs.slice(0, MAX_AUTHORS).map((ref) =>
            fetchJson<AuthorResponse>(`${ref.author.key}.json`, signal)
        )
    );
    return results
        .filter(
            (result): result is PromiseFulfilledResult<AuthorResponse> =>
                result.status === "fulfilled"
        )
        .map((result) => result.value.name);
}

export async function fetchWork(workId: string, signal?: AbortSignal): Promise<WorkDetails> {
    const work = await fetchJson<WorkDetailResponse>(`/works/${workId}.json`, signal);
    const authors = await fetchAuthorNames(work.authors, signal);
    return {
        title: work.title,
        authors,
        description: normalizeDescription(work.description),
        subjects: work.subjects ?? [],
        coverId: work.covers?.find((id) => id > 0),
        firstPublishYear: parseYear(work.first_publish_date),
    };
}
