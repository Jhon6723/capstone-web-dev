import type React from "react";
import type { CatalogStatus, CatalogView } from "../../types/catalog";

interface ResultsToolbarProps {
    status: CatalogStatus;
    total: number;
    page: number;
    pageSize: number;
    view: CatalogView;
    onViewChange: (view: CatalogView) => void;
    appliedQuery: string;
    isDefaultView: boolean;
    onOpenFilters: () => void;
}

function viewButtonClass(active: boolean): string {
    const base =
        "rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-indigo-600";
    return active
        ? `${base} bg-indigo-600 text-white`
        : `${base} text-slate-600 hover:bg-slate-100`;
}

const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
    status,
    total,
    page,
    pageSize,
    view,
    onViewChange,
    appliedQuery,
    isDefaultView,
    onOpenFilters,
}) => {
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    const trimmedQuery = appliedQuery.trim();

    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-slate-600">
                {status === "loading" && "Cargando resultados..."}
                {status === "error" && "No se pudieron cargar los resultados."}
                {status === "success" &&
                    `Mostrando ${start}-${end} de ${total} resultados${
                        trimmedQuery ? ` para "${trimmedQuery}"` : ""
                    }${isDefaultView ? " (tendencias)" : ""}`}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenFilters}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-400 md:hidden"
                >
                    Filtros
                </button>
                <div
                    role="group"
                    aria-label="Cambiar vista de resultados"
                    className="flex rounded-lg border border-slate-300 bg-white p-0.5"
                >
                    <button
                        type="button"
                        aria-pressed={view === "grid"}
                        onClick={() => onViewChange("grid")}
                        className={viewButtonClass(view === "grid")}
                    >
                        Grilla
                    </button>
                    <button
                        type="button"
                        aria-pressed={view === "list"}
                        onClick={() => onViewChange("list")}
                        className={viewButtonClass(view === "list")}
                    >
                        Lista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsToolbar;
