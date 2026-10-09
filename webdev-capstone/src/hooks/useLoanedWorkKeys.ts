import { useEffect, useState } from "react";
import { fetchLoanedWorkKeys } from "../services/supabase/library";

interface LoanedWorkKeysResult {
    loaned: Set<string> | null;
    error: boolean;
}

export function useLoanedWorkKeys(
    keys: string[],
    refreshKey?: unknown
): LoanedWorkKeysResult {
    const [result, setResult] = useState<{
        keys: string;
        loaned: Set<string> | null;
        error: boolean;
    } | null>(null);
    const joinedKeys = keys.join(",");

    useEffect(() => {
        let stale = false;
        fetchLoanedWorkKeys(joinedKeys ? joinedKeys.split(",") : [])
            .then((loaned) => {
                if (!stale) setResult({ keys: joinedKeys, loaned, error: false });
            })
            .catch(() => {
                if (!stale) setResult({ keys: joinedKeys, loaned: null, error: true });
            });
        return () => {
            stale = true;
        };
    }, [joinedKeys, refreshKey]);

    if (!result || result.keys !== joinedKeys) return { loaned: null, error: false };
    return { loaned: result.loaned, error: result.error };
}
