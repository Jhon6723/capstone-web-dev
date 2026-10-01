import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../contexts/auth-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirm?: string;
        form?: string;
    }>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (!name.trim()) next.name = "Ingresa tu nombre.";
        if (!EMAIL_RE.test(email.trim())) next.email = "Ingresa un email válido.";
        if (password.length < MIN_PASSWORD_LENGTH)
            next.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
        if (confirm !== password) next.confirm = "Las contraseñas no coinciden.";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setSubmitting(true);
        const result = await register(name, email, password);
        setSubmitting(false);
        if (!result.ok) {
            setErrors({ form: result.error });
            return;
        }
        navigate("/");
    };

    return (
        <main className="mx-auto w-full max-w-md px-4 pb-12 sm:px-6">
            <h1 className="mt-10 text-2xl font-bold sm:text-3xl">Crear cuenta</h1>
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
                    id="register-name"
                    label="Nombre"
                    value={name}
                    onChange={setName}
                    error={errors.name}
                    autoComplete="name"
                />
                <FormField
                    id="register-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    autoComplete="email"
                />
                <FormField
                    id="register-password"
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    autoComplete="new-password"
                />
                <FormField
                    id="register-confirm"
                    label="Confirmar contraseña"
                    type="password"
                    value={confirm}
                    onChange={setConfirm}
                    error={errors.confirm}
                    autoComplete="new-password"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Creando cuenta..." : "Registrarse"}
                </button>
                <p className="text-center text-sm text-slate-600">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </form>
        </main>
    );
};

export default RegisterPage;
