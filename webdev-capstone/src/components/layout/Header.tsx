import { useState } from "react";
import type React from "react";

const NAV_ITEMS = [
    { label: "Inicio", href: "/" },
    { label: "Mis Préstamos", href: "/loans" },
    { label: "Lista de Deseos", href: "/wishlist" },
    { label: "Contacto", href: "/contact" },
];

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                <a href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-700">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                        aria-hidden="true"
                    >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    UniLibrary
                </a>
                <nav aria-label="Navegación principal" className="hidden md:block">
                    <ul className="flex items-center gap-6 text-sm font-medium text-slate-600">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className="rounded hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="hidden items-center gap-3 md:flex">
                    <a
                        href="/login"
                        className="rounded px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-700"
                    >
                        Iniciar Sesión
                    </a>
                    <a
                        href="/register"
                        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Registrarse
                    </a>
                </div>
                <button
                    type="button"
                    className="rounded p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-nav"
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-6 w-6"
                        aria-hidden="true"
                    >
                        {menuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </>
                        )}
                    </svg>
                </button>
            </div>
            {menuOpen && (
                <nav
                    id="mobile-nav"
                    aria-label="Navegación móvil"
                    className="border-t border-slate-200 md:hidden"
                >
                    <ul className="space-y-1 px-4 py-3 text-sm font-medium text-slate-700">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className="block rounded px-2 py-2 hover:bg-slate-100"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-3 border-t border-slate-100 px-4 py-3">
                        <a
                            href="/login"
                            className="rounded px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-700"
                        >
                            Iniciar Sesión
                        </a>
                        <a
                            href="/register"
                            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Registrarse
                        </a>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
