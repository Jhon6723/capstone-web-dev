import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "../components/auth/RequireAuth";
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
                path: "/loans",
                lazy: async () => {
                    const { default: MyLoansPage } = await import(
                        "../pages/loans/MyLoansPage"
                    );
                    return {
                        Component: () => (
                            <RequireAuth>
                                <MyLoansPage />
                            </RequireAuth>
                        ),
                    };
                },
            },
            {
                path: "/wishlist",
                lazy: async () => {
                    const { default: WishlistPage } = await import(
                        "../pages/wishlist/WishlistPage"
                    );
                    return {
                        Component: () => (
                            <RequireAuth>
                                <WishlistPage />
                            </RequireAuth>
                        ),
                    };
                },
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
