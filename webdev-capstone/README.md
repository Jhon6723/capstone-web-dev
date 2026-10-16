# UniLibrary

SPA de biblioteca universitaria construida con React, TypeScript y Vite. El catálogo
proviene de la Open Library API; la autenticación y la persistencia de préstamos,
reservas, lista de deseos y estado de lectura corren sobre Supabase con Row Level
Security. Proyecto final del curso de Desarrollo Web (Universidad Jala).

La documentación completa del proyecto (planificación, requisitos, arquitectura,
modelo de datos, decisiones y estrategia de pruebas) vive en `../docs`.

## Ejecución local

```bash
npm install
cp .env.example .env   # completar con las credenciales del proyecto Supabase
npm run dev
```

Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY se obtienen del dashboard
de Supabase (Project Settings -> API). La migración de la base de datos está en
`supabase/`.

## Scripts

```bash
npm run dev            # servidor de desarrollo
npm test               # suite en modo watch
npm run test:run       # suite en una pasada
npm run coverage       # pruebas con reporte de cobertura v8
npm run build          # build de producción (tsc -b + vite build)
npm run preview        # sirve el build localmente
npm run lint           # ESLint
npm run format:check   # verifica formato con Prettier
```

## Stack

| Componente          | Tecnología                         |
| ------------------- | ---------------------------------- |
| Lenguaje            | TypeScript                         |
| Framework           | React 19                           |
| Build               | Vite                               |
| Estado              | React Context API                  |
| Estilos             | Tailwind CSS 4                     |
| Enrutamiento        | React Router DOM (rutas lazy)      |
| Catálogo            | Open Library API (fetch con caché) |
| Auth y persistencia | Supabase Auth + Postgres con RLS   |
| Pruebas             | Vitest + React Testing Library     |
| Despliegue          | Vercel (ADR-010)                   |

## Estructura

```
src/
  app/         App, providers y router
  pages/       catalog, book-detail, loans, wishlist, auth, not-found
  components/  books (tarjetas, badges), auth (RequireAuth), layout, ui
  contexts/    AuthContext y LibraryContext (contrato + proveedor)
  hooks/       useLoanedWorkKeys (disponibilidad multiusuario)
  services/    open-library (API pública) y supabase (auth + library)
  types/       tipos de dominio y de las APIs
  utils/       utilidades puras (préstamos, ordenamiento)
tests/         suite Vitest organizada por capas + helpers compartidos
supabase/      esquema y migraciones SQL (tablas, RLS, funciones RPC)
```

## Autenticación y persistencia

Supabase Auth maneja registro, inicio y cierre de sesión. Los préstamos, reservas
y la biblioteca personal viven en Postgres protegidos por políticas RLS: cada
usuario solo ve sus datos. La disponibilidad se deriva de los préstamos activos
de todos los usuarios a través de la función loaned_work_keys, y las reservas se
cumplen automáticamente al devolver el libro (return_loan).

## Pruebas

89 pruebas en 14 archivos organizadas por capas bajo `tests/`. La estrategia,
los helpers compartidos y la verificación manual de las reglas multiusuario
están documentados en `../docs/quality/testing-strategy.md`.

## Despliegue

La aplicación se despliega en Vercel como sitio estático. `vercel.json` reescribe
todas las rutas a /index.html para que el router del cliente funcione al recargar
o compartir enlaces profundos. Las variables VITE_SUPABASE_URL y
VITE_SUPABASE_ANON_KEY se definen en el panel del proyecto de Vercel.
