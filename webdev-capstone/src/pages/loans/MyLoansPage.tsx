import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLibrary } from "../../contexts/library-context";
import { coverImageUrl } from "../../services/open-library/books";
import type { BookRef } from "../../types/library";
import { formatDate, isDueSoon, isOverdue } from "../../utils/loans";

const Thumb: React.FC<{ book: BookRef }> = ({ book }) => {
    const cover = coverImageUrl(book.coverId, "S");
    if (!cover) {
        return (
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
        );
    }
    return (
        <img
            src={cover}
            alt={`Portada de ${book.title}`}
            loading="lazy"
            className="h-20 w-14 shrink-0 rounded bg-slate-100 object-cover"
        />
    );
};

const MyLoansPage: React.FC = () => {
    const { status, loans, reservations, returnLoan, cancelReservation, reload } = useLibrary();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const activeLoans = loans.filter((loan) => loan.status === "active");
    const history = loans.filter((loan) => loan.status === "returned");
    const pendingReservations = reservations.filter(
        (reservation) => reservation.status === "pending"
    );
    const fulfilledReservations = reservations.filter(
        (reservation) => reservation.status === "fulfilled"
    );
    const cancelledReservations = reservations.filter(
        (reservation) => reservation.status === "cancelled"
    );

    const handleReturn = async (loanId: string) => {
        setBusyId(loanId);
        setActionError(null);
        const result = await returnLoan(loanId);
        setBusyId(null);
        if (!result.ok) setActionError(result.error);
    };

    const handleCancel = async (reservationId: string) => {
        setBusyId(reservationId);
        setActionError(null);
        const result = await cancelReservation(reservationId);
        setBusyId(null);
        if (!result.ok) setActionError(result.error);
    };

    if (status === "loading" || status === "idle") {
        return (
            <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
                <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Mis Préstamos</h1>
                <p role="status" className="mt-6 text-sm text-slate-500">
                    Cargando préstamos...
                </p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
                <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Mis Préstamos</h1>
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
                >
                    <p className="text-sm text-red-700">
                        Ocurrió un error al cargar tus préstamos.
                    </p>
                    <button
                        type="button"
                        onClick={() => void reload()}
                        className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
            <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Mis Préstamos</h1>
            <p className="mt-2 text-sm text-slate-500">
                {activeLoans.length} activos · {pendingReservations.length} reservas pendientes
                · {history.length} devueltos
            </p>

            {actionError && (
                <p
                    role="alert"
                    className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                    {actionError}
                </p>
            )}

            <section aria-label="Préstamos activos" className="mt-8">
                <h2 className="text-lg font-semibold">Préstamos activos</h2>
                {activeLoans.length === 0 ? (
                    <p role="status" className="mt-3 text-sm text-slate-500">
                        No tienes préstamos activos.
                    </p>
                ) : (
                    <ul className="mt-3 space-y-3">
                        {activeLoans.map((loan) => (
                            <li
                                key={loan.id}
                                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                <Thumb book={loan.book} />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <Link
                                        to={`/books/${loan.book.workKey}`}
                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                    >
                                        {loan.book.title}
                                    </Link>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Prestado el {formatDate(loan.borrowedAt)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Vence el {formatDate(loan.dueAt)}
                                    </p>
                                    {isOverdue(loan) && (
                                        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                            Vencido
                                        </span>
                                    )}
                                    {isDueSoon(loan) && (
                                        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                            Vence pronto
                                        </span>
                                    )}
                                    <div className="mt-auto pt-2">
                                        <button
                                            type="button"
                                            disabled={busyId === loan.id}
                                            onClick={() => void handleReturn(loan.id)}
                                            className="rounded border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Devolver
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label="Reservas" className="mt-10">
                <h2 className="text-lg font-semibold">Reservas</h2>
                {pendingReservations.length === 0 && fulfilledReservations.length === 0 ? (
                    <p role="status" className="mt-3 text-sm text-slate-500">
                        No tienes reservas.
                    </p>
                ) : (
                    <ul className="mt-3 space-y-3">
                        {fulfilledReservations.map((reservation) => (
                            <li
                                key={reservation.id}
                                className="flex gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                            >
                                <Thumb book={reservation.book} />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <Link
                                        to={`/books/${reservation.book.workKey}`}
                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                    >
                                        {reservation.book.title}
                                    </Link>
                                    <p className="mt-1 text-xs font-medium text-emerald-800">
                                        Disponible para ti
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Notificada el{" "}
                                        {reservation.notifiedAt
                                            ? formatDate(reservation.notifiedAt)
                                            : formatDate(reservation.createdAt)}
                                    </p>
                                </div>
                            </li>
                        ))}
                        {pendingReservations.map((reservation) => (
                            <li
                                key={reservation.id}
                                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                <Thumb book={reservation.book} />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <Link
                                        to={`/books/${reservation.book.workKey}`}
                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                    >
                                        {reservation.book.title}
                                    </Link>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Solicitada el {formatDate(reservation.createdAt)}
                                    </p>
                                    <span className="mt-1 inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                        Pendiente
                                    </span>
                                    <div className="mt-auto pt-2">
                                        <button
                                            type="button"
                                            disabled={busyId === reservation.id}
                                            onClick={() => void handleCancel(reservation.id)}
                                            className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {cancelledReservations.length > 0 && (
                    <ul className="mt-3 space-y-2 opacity-60">
                        {cancelledReservations.map((reservation) => (
                            <li
                                key={reservation.id}
                                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500"
                            >
                                {reservation.book.title} · reserva cancelada el{" "}
                                {formatDate(reservation.createdAt)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label="Historial de préstamos" className="mt-10">
                <h2 className="text-lg font-semibold">Historial</h2>
                {history.length === 0 ? (
                    <p role="status" className="mt-3 text-sm text-slate-500">
                        Todavía no has devuelto préstamos.
                    </p>
                ) : (
                    <ul className="mt-3 space-y-3">
                        {history.map((loan) => (
                            <li
                                key={loan.id}
                                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                <Thumb book={loan.book} />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <Link
                                        to={`/books/${loan.book.workKey}`}
                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                    >
                                        {loan.book.title}
                                    </Link>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDate(loan.borrowedAt)} —{" "}
                                        {loan.returnedAt
                                            ? formatDate(loan.returnedAt)
                                            : formatDate(loan.dueAt)}
                                    </p>
                                    <span className="mt-1 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        Devuelto
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default MyLoansPage;
