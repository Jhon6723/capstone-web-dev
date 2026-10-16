import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./tests/setup.ts",
        css: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            exclude: ["node_modules/", "tests/", "src/main.tsx"],
        },
    },
});
