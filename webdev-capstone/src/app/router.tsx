import { createBrowserRouter } from "react-router-dom";
import CatalogPage from "../pages/catalog/CatalogPage";
import NotFoundPage from "../pages/not-found/NotFoundPage";
import App from "./App";

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { path: "/", element: <CatalogPage /> },
            {
                path: "/books/:workKey",
                lazy: async () => ({
                    Component: (await import("../pages/book-detail/BookDetailPage")).default,
                }),
            },
            {
                path: "/login",
                lazy: async () => ({
                    Component: (await import("../pages/auth/LoginPage")).default,
                }),
            },
            {
                path: "/register",
                lazy: async () => ({
                    Component: (await import("../pages/auth/RegisterPage")).default,
                }),
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);
