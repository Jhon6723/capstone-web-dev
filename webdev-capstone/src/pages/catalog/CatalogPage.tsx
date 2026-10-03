import type React from "react";
import { useCallback, useEffect, useState } from "react";
import BookResults from "../../components/books/BookResults";
import { fetchTrending, PAGE_SIZE, searchBooks } from "../../services/open-library/books";
import type { Book } from "../../types/book";
import type { CatalogSort, CatalogStatus, CatalogView } from "../../types/catalog";
import { sortBooks } from "../../utils/sortBooks";
import CategoryPills from "./CategoryPills";
import FilterSidebar from "./FilterSidebar";
import Pagination from "./Pagination";
import ResultsToolbar from "./ResultsToolbar";
import SearchBar from "./SearchBar";

const DEBOUNCE_MS = 500;

const CatalogPage: React.FC = () => {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [appliedQuery, setAppliedQuery] = useState("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [sort, setSort] = useState<CatalogSort>("relevance");
    const [page, setPage] = useState(1);
    const [view, setView] = useState<CatalogView>("grid");
    const [status, setStatus] = useState<CatalogStatus>("loading");
    const [books, setBooks] = useState<Book[]>([]);
    const [total, setTotal] = useState(0);
    const [requestId, setRequestId] = useState(0);

    const isDefaultView = appliedQuery.trim() === "" && subjects.length === 0;

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query !== appliedQuery) {
                setAppliedQuery(query);
                setPage(1);
                setStatus("loading");
            }
        }, DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [query, appliedQuery]);

    useEffect(() => {
        const controller = new AbortController();
        const load = isDefaultView
            ? fetchTrending(controller.signal).then((all) => ({
                  books: sortBooks(all, sort).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
                  total: all.length,
              }))
            : searchBooks({ query: appliedQuery, subjects, sort, page }, controller.signal).then(
                  (paged) => ({ books: sortBooks(paged.books, sort), total: paged.total })
              );
        load.then((paged) => {
            if (controller.signal.aborted) return;
            setBooks(paged.books);
            setTotal(paged.total);
            setStatus("success");
        }).catch(() => {
            if (controller.signal.aborted) return;
            setBooks([]);
            setTotal(0);
            setStatus("error");
        });
        return () => controller.abort();
    }, [appliedQuery, subjects, sort, page, requestId, isDefaultView]);

    const handleSelectSubject = (subject: string | null) => {
        setSubjects(subject ? [subject] : []);
        setPage(1);
        setStatus("loading");
    };

    const handleToggleSubject = (subject: string) => {
        setSubjects((prev) =>
            prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]
        );
        setPage(1);
        setStatus("loading");
    };

    const handleSortChange = (next: CatalogSort) => {
        setSort(next);
        setPage(1);
        setStatus("loading");
    };

    const handlePageChange = (next: number) => {
        setPage(next);
        setStatus("loading");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmitSearch = () => {
        if (query === appliedQuery) return;
        setAppliedQuery(query);
        setPage(1);
        setStatus("loading");
    };

    const handleClearFilters = () => {
        setQuery("");
        setAppliedQuery("");
        setSubjects([]);
        setSort("relevance");
        setPage(1);
        setStatus("loading");
    };

    const handleRetry = useCallback(() => {
        setRequestId((id) => id + 1);
        setStatus("loading");
    }, []);

    return (
        <main className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
            <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Catálogo de Biblioteca</h1>
            <SearchBar query={query} onQueryChange={setQuery} onSubmit={handleSubmitSearch} />
            <CategoryPills subjects={subjects} onSelect={handleSelectSubject} />
            <div className="mt-6 flex items-start gap-8">
                <FilterSidebar
                    open={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                    subjects={subjects}
                    onToggleSubject={handleToggleSubject}
                    sort={sort}
                    onSortChange={handleSortChange}
                    onClearFilters={handleClearFilters}
                />
                <section aria-label="Resultados del catálogo" className="min-w-0 flex-1">
                    <ResultsToolbar
                        status={status}
                        total={total}
                        page={page}
                        pageSize={PAGE_SIZE}
                        view={view}
                        onViewChange={setView}
                        appliedQuery={appliedQuery}
                        isDefaultView={isDefaultView}
                        onOpenFilters={() => setFiltersOpen(true)}
                    />
                    <BookResults
                        status={status}
                        books={books}
                        view={view}
                        appliedQuery={appliedQuery}
                        onRetry={handleRetry}
                    />
                    <Pagination
                        page={page}
                        total={total}
                        pageSize={PAGE_SIZE}
                        onPageChange={handlePageChange}
                    />
                </section>
            </div>
        </main>
    );
};

export default CatalogPage;
