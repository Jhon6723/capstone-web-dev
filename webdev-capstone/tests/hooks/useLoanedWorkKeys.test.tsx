import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLoanedWorkKeys } from "../../src/hooks/useLoanedWorkKeys";
import { fetchLoanedWorkKeys } from "../../src/services/supabase/library";
import { deferred } from "../helpers";

vi.mock("../../src/services/supabase/library", () => ({
    fetchLoanedWorkKeys: vi.fn(),
}));

const fetchMock = vi.mocked(fetchLoanedWorkKeys);

describe("useLoanedWorkKeys", () => {
    beforeEach(() => {
        fetchMock.mockReset();
    });

    it("pasa de carga a datos cuando el servicio responde", async () => {
        fetchMock.mockResolvedValue(new Set(["OL1W"]));

        const { result } = renderHook(() => useLoanedWorkKeys(["OL1W", "OL2W"]));

        expect(result.current).toEqual({ loaned: null, error: false });
        await waitFor(() => expect(result.current.loaned).toEqual(new Set(["OL1W"])));
        expect(result.current.error).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith(["OL1W", "OL2W"]);
    });

    it("informa el error cuando el servicio falla", async () => {
        fetchMock.mockRejectedValue(new Error("network"));

        const { result } = renderHook(() => useLoanedWorkKeys(["OL1W"]));

        await waitFor(() => expect(result.current.error).toBe(true));
        expect(result.current.loaned).toBeNull();
    });

    it("ignora la respuesta de una consulta anterior", async () => {
        const first = deferred<Set<string>>();
        const second = deferred<Set<string>>();
        fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

        const { result, rerender } = renderHook(({ keys }) => useLoanedWorkKeys(keys), {
            initialProps: { keys: ["OL1W"] },
        });
        rerender({ keys: ["OL2W"] });

        await act(async () => second.resolve(new Set(["OL2W"])));
        await act(async () => first.resolve(new Set(["OL1W"])));

        expect(result.current.loaned).toEqual(new Set(["OL2W"]));
    });
});
