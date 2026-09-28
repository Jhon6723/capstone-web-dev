import type React from "react";

interface PaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, pageSize, onPageChange }) => {
    const pageCount = Math.ceil(total / pageSize);

    if (pageCount <= 1) return null;

    const buttonClass =
        "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <nav
            aria-label="Paginación del catálogo"
            className="mt-8 flex items-center justify-center gap-4"
        >
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className={buttonClass}
            >
                Anterior
            </button>
            <span className="text-sm text-slate-600">
                Página {page} de {pageCount}
            </span>
            <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
                className={buttonClass}
            >
                Siguiente
            </button>
        </nav>
    );
};

export default Pagination;
