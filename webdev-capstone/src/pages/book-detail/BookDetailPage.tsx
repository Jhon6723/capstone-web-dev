import type React from "react";
import { Link, useParams } from "react-router-dom";

const BookDetailPage: React.FC = () => {
    const { workKey } = useParams<{ workKey: string }>();

    return (
        <main className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
            <Link
                to="/"
                className="mt-8 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
                Volver al catálogo
            </Link>
            <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Detalle del libro</h1>
            <p className="mt-4 text-sm text-slate-600">
                Página en construcción. Obra: {workKey}
            </p>
        </main>
    );
};

export default BookDetailPage;
