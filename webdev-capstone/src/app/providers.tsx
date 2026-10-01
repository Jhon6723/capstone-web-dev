import type React from "react";
import { AuthProvider } from "../contexts/AuthContext";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
);

export default AppProviders;
