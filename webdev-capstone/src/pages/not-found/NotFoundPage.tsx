import type React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Página no encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
            La ruta que buscas no existe.{" "}
            <Link to="/" className="font-medium text-indigo-600 hover:underline">
                Volver al catálogo
            </Link>
        </p>
    </main>
);

export default NotFoundPage;
