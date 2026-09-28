import type React from "react";

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSubmit }) => {
    return (
        <form
            role="search"
            className="mt-6 flex gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <label htmlFor="catalog-search" className="sr-only">
                Buscar libros
            </label>
            <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar por título, autor o ISBN..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-500"
            />
        </form>
    );
};

export default SearchBar;
