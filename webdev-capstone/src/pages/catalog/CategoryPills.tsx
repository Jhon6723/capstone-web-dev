import type React from "react";
import { CATEGORIES } from "./categories";

interface CategoryPillsProps {
    subjects: string[];
    onSelect: (subject: string | null) => void;
}

function pillClass(active: boolean): string {
    const base =
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
    return active
        ? `${base} border-indigo-600 bg-indigo-600 text-white`
        : `${base} border-slate-300 bg-white text-slate-700 hover:border-indigo-400`;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ subjects, onSelect }) => {
    return (
        <div
            role="group"
            aria-label="Categorías rápidas"
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
            <button
                type="button"
                aria-pressed={subjects.length === 0}
                onClick={() => onSelect(null)}
                className={pillClass(subjects.length === 0)}
            >
                Todos
            </button>
            {CATEGORIES.map((category) => {
                const active = subjects.length === 1 && subjects[0] === category.subject;
                return (
                    <button
                        key={category.subject}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onSelect(category.subject)}
                        className={pillClass(active)}
                    >
                        {category.label}
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryPills;
