import type React from "react";
import type { CatalogSort } from "../../types/catalog";
import { CATEGORIES, SORT_OPTIONS } from "./categories";

interface FilterControlsProps {
    subjects: string[];
    onToggleSubject: (subject: string) => void;
    sort: CatalogSort;
    onSortChange: (sort: CatalogSort) => void;
    onClearFilters: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    subjects,
    onToggleSubject,
    sort,
    onSortChange,
    onClearFilters,
}) => {
    return (
        <div className="space-y-6">
            <fieldset>
                <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Categoría
                </legend>
                <ul className="mt-3 space-y-2">
                    {CATEGORIES.map((category) => (
                        <li key={category.subject}>
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={subjects.includes(category.subject)}
                                    onChange={() => onToggleSubject(category.subject)}
                                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                                />
                                {category.label}
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>
            <fieldset>
                <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Ordenar por
                </legend>
                <ul className="mt-3 space-y-2">
                    {SORT_OPTIONS.map((option) => (
                        <li key={option.value}>
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="radio"
                                    name="catalog-sort"
                                    checked={sort === option.value}
                                    onChange={() => onSortChange(option.value)}
                                    className="h-4 w-4 border-slate-300 accent-indigo-600"
                                />
                                {option.label}
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>
            <button
                type="button"
                onClick={onClearFilters}
                className="text-sm font-medium text-indigo-600 hover:underline"
            >
                Limpiar filtros
            </button>
        </div>
    );
};

interface FilterSidebarProps extends FilterControlsProps {
    open: boolean;
    onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ open, onClose, ...controls }) => {
    return (
        <>
            <aside
                aria-label="Filtros del catálogo"
                className="hidden w-56 shrink-0 rounded-lg border border-slate-200 bg-white p-4 md:block"
            >
                <FilterControls {...controls} />
            </aside>
            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Filtros del catálogo"
                    className="fixed inset-0 z-40 md:hidden"
                >
                    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
                    <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-4 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Filtros</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Cerrar filtros"
                                className="rounded p-1 text-slate-600 hover:bg-slate-100"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <FilterControls {...controls} />
                    </aside>
                </div>
            )}
        </>
    );
};

export default FilterSidebar;
