import type React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <p role="status" className="mx-auto w-full max-w-7xl px-4 py-10 text-sm text-slate-500 sm:px-6">
                Comprobando sesión...
            </p>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
};

export default RequireAuth;
