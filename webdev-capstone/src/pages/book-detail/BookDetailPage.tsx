import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AvailabilityBadge from "../../components/books/AvailabilityBadge";
import { useAuth } from "../../contexts/auth-context";
import type { ActionResult } from "../../contexts/library-context";
import { useLibrary } from "../../contexts/library-context";
import { useLoanedWorkKeys } from "../../hooks/useLoanedWorkKeys";
import { coverImageUrl } from "../../services/open-library/books";
import type { WorkDetails } from "../../services/open-library/works";
import { fetchWork } from "../../services/open-library/works";
import type { Book } from "../../types/book";
import type { CatalogStatus } from "../../types/catalog";
import type { BookRef, ReadingStatus } from "../../types/library";
import { formatDate, toWorkId } from "../../utils/loans";

const MAX_SUBJECTS = 8;

const DetailSkeleton: React.FC = () => (
    <div role="status" aria-label="Cargando detalle del libro" className="animate-pulse">
        <span className="sr-only">Cargando detalle del libro...</span>
        <div className="flex flex-col gap-8 md:flex-row">
            <div className="aspect-[2/3] w-full max-w-xs rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-4">
                <div className="h-8 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-1/4 rounded bg-slate-200" />
                <div className="flex gap-2">
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="space-y-2 pt-4">
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-5/6 rounded bg-slate-200" />
                </div>
            </div>
        </div>
    </div>
);

type WorkResult =
    | { workKey: string; status: "success"; data: WorkDetails }
    | { workKey: string; status: "error" };

const BookDetailPage: React.FC = () => {
    const { workKey } = useParams<{ workKey: string }>();
    const location = useLocation();
    const catalogBook = (location.state as { book?: Book } | null)?.book;
    const [result, setResult] = useState<WorkResult | null>(null);
    const [requestId, setRequestId] = useState(0);
    const { user } = useAuth();
    const {
        loans,
        activeLoanFor,
        pendingReservationFor,
        entryFor,
        borrow,
        returnLoan,
        reserve,
        cancelReservation,
        setReadingStatus,
        removeEntry,
    } = useLibrary();
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<{
        kind: "success" | "error";
        text: string;
    } | null>(null);

    const workId = workKey ? toWorkId(workKey) : "";
    const { loaned, error: availabilityError } = useLoanedWorkKeys(workId ? [workId] : [], loans);
    const myLoan = workId ? activeLoanFor(workId) : undefined;
    const myReservation = workId ? pendingReservationFor(workId) : undefined;
    const entry = workId ? entryFor(workId) : undefined;
    const isLoaned = workId ? loaned?.has(workId) === true : false;

    const status: CatalogStatus =
        result && result.workKey === workKey ? result.status : "loading";
    const detail =
        result && result.workKey === workKey && result.status === "success"
            ? result.data
            : null;

    useEffect(() => {
        if (!workKey) return;
        const controller = new AbortController();
        fetchWork(workKey, controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;
                setResult({ workKey, status: "success", data });
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setResult({ workKey, status: "error" });
            });
        return () => controller.abort();
    }, [workKey, requestId]);

    const handleRetry = () => {
        setResult(null);
        setRequestId((id) => id + 1);
    };

    const title = detail?.title ?? catalogBook?.title;
    const authors = catalogBook?.authors.length ? catalogBook.authors : (detail?.authors ?? []);
    const coverId = catalogBook?.coverId ?? detail?.coverId;
    const year = catalogBook?.firstPublishYear ?? detail?.firstPublishYear;
    const availability = loaned
        ? isLoaned
            ? "unavailable"
            : "available"
        : undefined;
    const cover = coverImageUrl(coverId, "L");

    const bookRef: BookRef | null =
        workId && title
            ? {
                  workKey: workId,
                  title,
                  authors,
                  ...(coverId !== undefined ? { coverId } : {}),
                  ...(year !== undefined ? { firstPublishYear: year } : {}),
              }
            : null;

    const runAction = async (
        action: () => Promise<ActionResult>,
        successText: string
    ): Promise<void> => {
        setBusy(true);
        setFeedback(null);
        const actionResult = await action();
        setBusy(false);
        setFeedback(
            actionResult.ok
                ? { kind: "success", text: successText }
                : { kind: "error", text: actionResult.error }
        );
    };

    const handleReadingStatus = (value: string) => {
        if (!bookRef) return;
        if (value === "") {
            void runAction(() => removeEntry(workId), "Estado de lectura eliminado.");
            return;
        }
        void runAction(
            () => setReadingStatus(bookRef, value as ReadingStatus),
            "Estado de lectura actualizado."
        );
    };

    return (
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
            <Link
                to="/"
                className="mt-8 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
                ← Volver al catálogo
            </Link>

            {status === "loading" && !catalogBook && <div className="mt-6"><DetailSkeleton /></div>}

            {status === "error" && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
                >
                    <p className="text-sm text-red-700">
                        Ocurrió un error al cargar el detalle del libro.
                    </p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {(status === "success" || catalogBook) && (
                <article className="mt-6 flex flex-col gap-8 md:flex-row">
                    <div className="w-full max-w-xs shrink-0">
                        {cover ? (
                            <img
                                src={cover}
                                alt={title ? `Portada de ${title}` : "Portada del libro"}
                                className="aspect-[2/3] w-full rounded-lg bg-slate-100 object-cover shadow-sm"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-slate-200 text-slate-400"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-16 w-16"
                                >
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {title ?? "Sin título"}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            {authors.length > 0 ? authors.join(", ") : "Autor desconocido"}
                        </p>
                        {year && <p className="mt-1 text-sm text-slate-500">{year}</p>}

                        {availability && (
                            <div className="mt-4">
                                <AvailabilityBadge availability={availability} />
                            </div>
                        )}

                        {detail?.subjects && detail.subjects.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {detail.subjects.slice(0, MAX_SUBJECTS).map((subject) => (
                                    <span
                                        key={subject}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        )}

                        {status === "loading" && catalogBook && (
                            <p role="status" className="mt-6 text-sm text-slate-400">
                                Cargando descripción...
                            </p>
                        )}

                        {detail?.description && (
                            <p className="mt-6 text-sm leading-relaxed text-slate-700">
                                {detail.description}
                            </p>
                        )}

                        {!user && (
                            <div className="mt-8">
                                <Link
                                    to="/login"
                                    state={{ from: location }}
                                    className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Inicia sesión para pedir prestado o reservar
                                </Link>
                            </div>
                        )}

                        {user && loaned === null && (
                            <p
                                role={availabilityError ? "alert" : "status"}
                                className={`mt-8 text-sm ${availabilityError ? "text-red-700" : "text-slate-400"}`}
                            >
                                {availabilityError
                                    ? "No se pudo comprobar la disponibilidad. Recarga la página."
                                    : "Comprobando disponibilidad..."}
                            </p>
                        )}

                        {user && loaned !== null && (
                            <div className="mt-8">
                                {myLoan ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-slate-700">
                                            Lo tienes prestado · vence{" "}
                                            {formatDate(myLoan.dueAt)}
                                        </p>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                void runAction(
                                                    () => returnLoan(myLoan.id),
                                                    "Devolución registrada."
                                                )
                                            }
                                            className="rounded border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Devolver
                                        </button>
                                    </div>
                                ) : myReservation ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-slate-700">
                                            Reserva pendiente
                                        </p>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                void runAction(
                                                    () => cancelReservation(myReservation.id),
                                                    "Reserva cancelada."
                                                )
                                            }
                                            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancelar reserva
                                        </button>
                                    </div>
                                ) : isLoaned ? (
                                    <button
                                        type="button"
                                        disabled={busy || !bookRef}
                                        onClick={() =>
                                            bookRef &&
                                            void runAction(
                                                () => reserve(bookRef),
                                                "Reserva registrada."
                                            )
                                        }
                                        className="rounded border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Reservar
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={busy || !bookRef}
                                        onClick={() =>
                                            bookRef &&
                                            void runAction(
                                                () => borrow(bookRef),
                                                "Préstamo registrado."
                                            )
                                        }
                                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Pedir prestado
                                    </button>
                                )}
                            </div>
                        )}

                        {feedback && (
                            <p
                                role={feedback.kind === "error" ? "alert" : "status"}
                                className={`mt-3 text-sm ${
                                    feedback.kind === "error"
                                        ? "text-red-700"
                                        : "text-emerald-700"
                                }`}
                            >
                                {feedback.text}
                            </p>
                        )}

                        {user && bookRef && (
                            <div className="mt-6">
                                <label
                                    htmlFor="reading-status"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Estado de lectura
                                </label>
                                <select
                                    id="reading-status"
                                    value={entry?.status ?? ""}
                                    disabled={busy}
                                    onChange={(e) => handleReadingStatus(e.target.value)}
                                    className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Sin estado</option>
                                    <option value="reading">Leyendo</option>
                                    <option value="completed">Completado</option>
                                    <option value="wishlist">Lista de deseos</option>
                                </select>
                            </div>
                        )}
                    </div>
                </article>
            )}
        </main>
    );
};

export default BookDetailPage;
