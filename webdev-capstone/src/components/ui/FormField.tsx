import type React from "react";

interface FormFieldProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    autoComplete?: string;
}

const INPUT_CLASSES =
    "mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-600 aria-[invalid=true]:border-red-400";

const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    error,
    autoComplete,
}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={INPUT_CLASSES}
        />
        {error && (
            <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
                {error}
            </p>
        )}
    </div>
);

export default FormField;
