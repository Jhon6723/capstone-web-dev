import type React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../contexts/auth-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>(
        {}
    );
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (!EMAIL_RE.test(email.trim())) next.email = "Ingresa un email válido.";
        if (!password) next.password = "Ingresa tu contraseña.";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setSubmitting(true);
        const result = await login(email, password);
        setSubmitting(false);
        if (!result.ok) {
            setErrors({ form: result.error });
            return;
        }
        navigate(from ?? "/", { replace: true });
    };

    return (
        <main className="mx-auto w-full max-w-md px-4 pb-12 sm:px-6">
            <h1 className="mt-10 text-2xl font-bold sm:text-3xl">Iniciar sesión</h1>
            <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
                {errors.form && (
                    <p
                        role="alert"
                        className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                        {errors.form}
                    </p>
                )}
                <FormField
                    id="login-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    autoComplete="email"
                />
                <FormField
                    id="login-password"
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    autoComplete="current-password"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Ingresando..." : "Iniciar sesión"}
                </button>
                <p className="text-center text-sm text-slate-600">
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" className="font-medium text-indigo-600 hover:underline">
                        Regístrate
                    </Link>
                </p>
            </form>
        </main>
    );
};

export default LoginPage;
