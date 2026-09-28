import type React from "react";
import type { Book } from "../../types/book";
import type { CatalogStatus, CatalogView } from "../../types/catalog";
import BookCard from "./BookCard";

interface BookResultsProps {
    status: CatalogStatus;
    books: Book[];
    view: CatalogView;
    appliedQuery: string;
    onRetry: () => void;
}

const BookResults: React.FC<BookResultsProps> = ({
    status,
    books,
    view,
    appliedQuery,
    onRetry,
}) => {
    if (status === "loading") {
        return (
            <div role="status" aria-label="Cargando resultados">
                <span className="sr-only">Cargando resultados...</span>
                <ul
                    aria-hidden="true"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {Array.from({ length: 6 }).map((_, index) => (
                        <li key={index} className="h-72 animate-pulse rounded-lg bg-slate-200" />
                    ))}
                </ul>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
            >
                <p className="text-sm text-red-700">Ocurrió un error al consultar el catálogo.</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div
                role="status"
                className="rounded-lg border border-slate-200 bg-white p-10 text-center"
            >
                <p className="text-sm text-slate-600">
                    No se encontraron resultados
                    {appliedQuery.trim() ? ` para "${appliedQuery.trim()}"` : ""}.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    Prueba con otro término o ajusta los filtros.
                </p>
            </div>
        );
    }

    return (
        <ul
            className={
                view === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-3"
            }
        >
            {books.map((book) => (
                <BookCard key={book.workKey} book={book} view={view} />
            ))}
        </ul>
    );
};

export default BookResults;
