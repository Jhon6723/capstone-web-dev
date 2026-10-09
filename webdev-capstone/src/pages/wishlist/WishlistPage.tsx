import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AvailabilityBadge from "../../components/books/AvailabilityBadge";
import { useLibrary } from "../../contexts/library-context";
import { useLoanedWorkKeys } from "../../hooks/useLoanedWorkKeys";
import { coverImageUrl } from "../../services/open-library/books";
import { toWorkId } from "../../utils/loans";

const WishlistPage: React.FC = () => {
    const { status, entries, removeEntry } = useLibrary();
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const wishlist = entries.filter((entry) => entry.status === "wishlist");
    const workKeys = wishlist.map((entry) => toWorkId(entry.book.workKey));
    const { loaned } = useLoanedWorkKeys(workKeys, wishlist.length);

    const handleRemove = async (workKey: string) => {
        setBusyKey(workKey);
        setActionError(null);
        const result = await removeEntry(workKey);
        setBusyKey(null);
        if (!result.ok) setActionError(result.error);
    };

    if (status === "loading" || status === "idle") {
        return (
            <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
                <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Lista de Deseos</h1>
                <p role="status" className="mt-6 text-sm text-slate-500">
                    Cargando tu lista...
                </p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
                <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Lista de Deseos</h1>
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
                >
                    <p className="text-sm text-red-700">
                        Ocurrió un error al cargar tu lista de deseos.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
            <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Lista de Deseos</h1>

            {actionError && (
                <p
                    role="alert"
                    className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                    {actionError}
                </p>
            )}

            {wishlist.length === 0 ? (
                <div
                    role="status"
                    className="mt-6 rounded-lg border border-slate-200 bg-white p-10 text-center"
                >
                    <p className="text-sm text-slate-600">Tu lista de deseos está vacía.</p>
                    <p className="mt-1 text-xs text-slate-400">
                        Marca libros como Lista de deseos desde el detalle de un libro.
                    </p>
                </div>
            ) : (
                <ul className="mt-6 space-y-3">
                    {wishlist.map((entry) => {
                        const workId = toWorkId(entry.book.workKey);
                        const cover = coverImageUrl(entry.book.coverId, "S");
                        const authors =
                            entry.book.authors.length > 0
                                ? entry.book.authors.join(", ")
                                : "Autor desconocido";
                        return (
                            <li
                                key={entry.book.workKey}
                                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt={`Portada de ${entry.book.title}`}
                                        loading="lazy"
                                        className="h-20 w-14 shrink-0 rounded bg-slate-100 object-cover"
                                    />
                                ) : (
                                    <div
                                        aria-hidden="true"
                                        className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-slate-200 text-slate-400"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6"
                                        >
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <Link
                                        to={`/books/${workId}`}
                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                    >
                                        {entry.book.title}
                                    </Link>
                                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                        {authors}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                        {loaned && (
                                            <AvailabilityBadge
                                                availability={
                                                    loaned.has(workId)
                                                        ? "unavailable"
                                                        : "available"
                                                }
                                            />
                                        )}
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/books/${workId}`}
                                                className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                            >
                                                Ver detalle
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={busyKey === entry.book.workKey}
                                                onClick={() =>
                                                    void handleRemove(entry.book.workKey)
                                                }
                                                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Quitar de la lista
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
};

export default WishlistPage;
