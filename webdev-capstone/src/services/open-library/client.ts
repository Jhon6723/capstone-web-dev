const BASE_URL = "https://openlibrary.org";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
    data: unknown;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export class OpenLibraryError extends Error {
    public readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "OpenLibraryError";
        this.status = status;
    }
}

export async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const cached = cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data as T;
    }
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new OpenLibraryError(
            `Open Library request failed: ${response.status}`,
            response.status
        );
    }
    const data = (await response.json()) as T;
    cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
}
