import type React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { LibraryProvider } from "../contexts/LibraryContext";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
        <LibraryProvider>{children}</LibraryProvider>
    </AuthProvider>
);

export default AppProviders;
