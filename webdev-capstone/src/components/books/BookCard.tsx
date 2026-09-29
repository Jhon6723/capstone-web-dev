import type React from "react";
import { Link } from "react-router-dom";
import { coverImageUrl } from "../../services/open-library/books";
import type { Book } from "../../types/book";
import type { CatalogView } from "../../types/catalog";
import AvailabilityBadge from "./AvailabilityBadge";

interface CoverImageProps {
    cover: string | null;
    title: string;
    className: string;
}

const CoverImage: React.FC<CoverImageProps> = ({ cover, title, className }) => {
    if (!cover) {
        return (
            <div
                aria-hidden="true"
                className={`flex items-center justify-center bg-slate-200 text-slate-400 ${className}`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10"
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
            alt={`Portada de ${title}`}
            loading="lazy"
            className={`bg-slate-100 object-cover ${className}`}
        />
    );
};

interface BookCardProps {
    book: Book;
    view: CatalogView;
}

const BookCard: React.FC<BookCardProps> = ({ book, view }) => {
    const cover = coverImageUrl(book.coverId, "M");
    const detailHref = `/books/${book.workKey.split("/").pop()}`;
    const authors = book.authors.length > 0 ? book.authors.join(", ") : "Autor desconocido";
    const year = book.firstPublishYear ?? "Año desconocido";

    if (view === "list") {
        return (
            <li className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <CoverImage
                    cover={cover}
                    title={book.title}
                    className="h-32 w-24 shrink-0 rounded"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="text-sm font-semibold">{book.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{authors}</p>
                    <p className="text-xs text-slate-500">{year}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <AvailabilityBadge availability={book.availability} />
                        <Link
                            to={detailHref}
                            className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                            Ver detalle
                        </Link>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <CoverImage cover={cover} title={book.title} className="aspect-[2/3] w-full" />
            <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className="line-clamp-2 text-sm font-semibold">{book.title}</h3>
                <p className="line-clamp-1 text-xs text-slate-500">{authors}</p>
                <p className="text-xs text-slate-500">{year}</p>
                <div className="mt-auto space-y-2 pt-2">
                    <AvailabilityBadge availability={book.availability} />
                    <Link
                        to={detailHref}
                        className="block rounded bg-indigo-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-indigo-700"
                    >
                        Ver detalle
                    </Link>
                </div>
            </div>
        </li>
    );
};

export default BookCard;
