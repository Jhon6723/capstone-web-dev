# Estilos con Tailwind CSS

Semana 3 - Características principales

Documentación del sistema de estilos de UniLibrary. La decisión de usar Tailwind CSS está en ADR-003 (`docs/decisions.md`).

## Bootstrap e integración

Tailwind CSS v4 se integra sin PostCSS ni archivo de configuración:

1. El plugin @tailwindcss/vite se registra en `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react(), tailwindcss()],
});
```

2. La hoja de estilos global `src/styles/index.css` contiene una única directiva:

```css
@import "tailwindcss";
```

3. `src/main.tsx` importa esa hoja, lo que inyecta las utilidades generadas en el bundle.

Tailwind escanea los archivos del proyecto, genera solo las clases usadas y las sirve/bundlea a través de Vite. No existe tailwind.config.js: con la configuración por defecto de v4 alcanza para el alcance del proyecto.

## Enfoque

- Utility-first: los estilos se escriben como clases en el JSX, junto al marcado. No hay hojas de estilo por componente ni CSS Modules.
- Mobile-first: las clases base aplican a móvil y los breakpoints sm, md y lg escalan hacia pantallas más grandes.
- prettier-plugin-tailwindcss ordena las clases automáticamente al correr npm run format, por lo que el orden en el código es consistente.

## Paleta de colores en uso

| Familia | Rol en la UI | Ejemplos |
|---|---|---|
| slate | Neutros: fondos, bordes, texto secundario | bg-slate-50, border-slate-200, text-slate-600 |
| indigo | Color primario: acciones, enlaces, estados activos | bg-indigo-600, text-indigo-700, outline-indigo-600 |
| emerald | Disponibilidad positiva | badge Disponible (bg-emerald-100 text-emerald-800) |
| amber | Disponibilidad negativa | badge Prestado (bg-amber-100 text-amber-800) |
| red | Errores | panel de error y botón Reintentar |
| white / black | Superficies y overlays | tarjetas bg-white, overlay bg-black/40 |

## Breakpoints responsivos

Se usan tres breakpoints de Tailwind, siempre en dirección mobile-first:

| Patrón | Significado | Uso real en el proyecto |
|---|---|---|
| base (sin prefijo) | Móvil | grid-cols-1, una columna de resultados |
| sm: | >= 640px | sm:grid-cols-2, sm:text-3xl, sm:px-6 |
| md: | >= 768px | md:block / md:hidden para sidebar y navegación, md:flex |
| lg: | >= 1024px | lg:grid-cols-3, grilla de tres columnas en escritorio |

Ejemplo real de la grilla de resultados (`src/components/books/BookResults.tsx`):

```
grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3
```

1 columna en móvil, 2 en tablet, 3 en escritorio, sin cambiar de componente.

## Variantes de estado

| Variante | Cantidad aprox. | Uso |
|---|---|---|
| hover: | 16 | Estados hover de botones, enlaces y tarjetas |
| focus-visible: | 8 | Anillos de foco visibles solo al navegar con teclado |
| focus: | 3 | Bordes de foco en inputs |
| disabled: | 2 | Botones de paginación deshabilitados |
| active: | 2 | Estados presionados |

La preferencia por focus-visible sobre focus es deliberada: el anillo aparece al navegar con teclado pero no al hacer clic con el mouse, cumpliendo RF8 (accesibilidad) sin degradar la experiencia visual.

## Patrones de UI recurrentes

| Patrón | Clases características | Dónde |
|---|---|---|
| Tarjeta | rounded-lg border border-slate-200 bg-white shadow-sm | BookCard, paneles de estado, sidebar |
| Pill de categoría | rounded-full border px-4 py-1.5 | CategoryPills |
| Badge de disponibilidad | rounded-full px-2 py-0.5 text-xs font-medium | AvailabilityBadge |
| Botón primario | rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 | Ver detalle, Registrarse |
| Skeleton de carga | animate-pulse rounded-lg bg-slate-200 | BookResults (estado loading) |
| Header pegajoso | sticky top-0 z-30 border-b bg-white | Header |
| Drawer móvil | fixed inset-0 z-40 + overlay bg-black/40 | FilterSidebar en móvil |
| Texto truncado | line-clamp-1 / line-clamp-2 | Títulos y autores en BookCard |
| Proporción de portada | aspect-[2/3] | Portada en vista grilla |
| Solo lectores de pantalla | sr-only | Labels y mensajes de carga |

## Valores arbitrarios

Tailwind permite valores puntuales con corchetes sin ampliar la escala de diseño. Se usa en un solo lugar: aspect-[2/3] para la proporción de las portadas de libros.

## Guía de className

Convenciones para escribir clases en los componentes. Todos los ejemplos son código real del proyecto.

### Reglas generales

- Todo estilo vive en className con utilidades de Tailwind. No se usan hojas de estilo por componente, atributos style ni clases CSS propias.
- No hay dependencias de composición (clsx, classnames, tailwind-merge): la combinación de clases se hace con template literals nativos.
- El orden de las clases dentro del string no se escribe a mano: prettier-plugin-tailwindcss lo normaliza al correr npm run format.
- Los atributos semánticos (aria-pressed, aria-label, disabled) van fuera de className; las variantes de Tailwind (hover:, focus-visible:, disabled:) van dentro.

### Patrón 1 — String estático

Cuando el elemento tiene un solo aspecto, className es un string plano:

```tsx
<button type="button" className={buttonClass}>
```

En `src/pages/catalog/Pagination.tsx` los dos botones Anterior/Siguiente comparten la constante buttonClass para no repetir el combo.

### Patrón 2 — Base + variante condicional

Cuando un elemento tiene estado activo/inactivo, se extrae una función que compone una base común con el sufijo de cada estado. Ejemplo de `src/pages/catalog/CategoryPills.tsx`:

```tsx
function pillClass(active: boolean): string {
    const base =
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
    return active
        ? `${base} border-indigo-600 bg-indigo-600 text-white`
        : `${base} border-slate-300 bg-white text-slate-700 hover:border-indigo-400`;
}
```

La base contiene lo estructural (forma, tipografía, foco) y la variante solo lo que cambia (colores). Se usa también en viewButtonClass de ResultsToolbar. Regla: si el combo se repite dos o más veces en el mismo archivo, se extrae a una función o constante.

### Patrón 3 — Ternario inline

Para variantes únicas que no se repiten, el condicional va dentro del template literal sin extraer función:

```tsx
// AvailabilityBadge.tsx
className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
    available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
}`}
```

### Patrón 4 — Clase elegida entre alternativas completas

Cuando la variante cambia toda la clase y no comparte base, el ternario selecciona el string completo:

```tsx
// BookResults.tsx — grilla o lista
className={
    view === "grid"
        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        : "flex flex-col gap-3"
}
```

### Patrón 5 — className como prop de composición

Los componentes con variantes de tamaño/posición reciben className por props y lo fusionan con sus clases propias. Ejemplo: CoverImage en `src/components/books/BookCard.tsx`:

```tsx
const CoverImage: React.FC<CoverImageProps> = ({ cover, title, className }) => (
    <img className={`bg-slate-100 object-cover ${className}`} ... />
);

// Vista grilla:
<CoverImage className="aspect-[2/3] w-full" ... />
// Vista lista:
<CoverImage className="h-32 w-24 shrink-0 rounded" ... />
```

El componente define lo invariante (object-cover, fondo de placeholder) y el padre inyecta lo contextual (tamaño, proporción). Regla: las clases propias van primero en el template, la prop al final.

### Resumen de decisión

| Situación | Patrón |
|---|---|
| Un solo aspecto, repetido | String estático o constante compartida |
| Mismo elemento, estado on/off | Función base + variante (patrón 2) |
| Variante única, no repetida | Ternario inline (patrón 3) |
| Variantes sin base común | Ternario de strings completos (patrón 4) |
| El padre decide tamaño/forma | className como prop (patrón 5) |

## Relación con los requisitos

| Requisito | Cómo lo cubre el sistema de estilos |
|---|---|
| RF7 (mobile-first responsivo) | Breakpoints sm/md/lg y patrones como el sidebar que colapsa a drawer en móvil |
| RF8 (accesibilidad) | focus-visible, sr-only, contraste de la paleta slate/indigo |
| RNF4 (feedback visual) | Skeletons animate-pulse, badges de estado, hover/disabled |
| ADR-003 | Tailwind CSS v4 vía @tailwindcss/vite, sin PostCSS |
