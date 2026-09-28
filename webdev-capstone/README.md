# UniLibrary

SPA de gestión y exploración de libros para una biblioteca universitaria. Proyecto final del curso de Desarrollo Web (Universidad Jala).

La documentación del proyecto (planificación, requisitos, arquitectura, modelo de datos y decisiones) vive en `../docs`.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (plugin @tailwindcss/vite)
- React Context API para la gestión de estado
- Fetch API contra la Open Library API
- Prettier + ESLint (flat config)

## Scripts

| Comando              | Descripción                      |
| -------------------- | -------------------------------- |
| npm run dev          | Servidor de desarrollo           |
| npm run build        | Build de producción (tsc + vite) |
| npm run lint         | ESLint                           |
| npm run format       | Formatea con Prettier            |
| npm run format:check | Verifica formato                 |
| npm run preview      | Sirve el build localmente        |

## Estructura

```
src/
  app/         App
  pages/       Paginas por dominio (catalog; book-detail, loans, wishlist y auth en semanas 4-5)
  components/  Componentes reutilizables (books, layout)
  services/    Clientes y servicios (open-library; storage y loans en semanas 4-5)
  types/       Tipos de dominio y de la API
  utils/       Utilidades puras
  styles/      Hojas de estilo globales
```

El estado del catalogo vive en CatalogPage (useState + props). Los contextos de React
(auth y library) se incorporan en las semanas 4-5 cuando el estado deba compartirse
entre paginas.
