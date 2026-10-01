const PREFIX = "unilibrary:v1:";

export function storageKey(suffix: string): string {
    return `${PREFIX}${suffix}`;
}

export function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
}

export function writeJson(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Cuota excedida o storage no disponible: la escritura se descarta.
    }
}

export function removeKey(key: string): void {
    localStorage.removeItem(key);
}
