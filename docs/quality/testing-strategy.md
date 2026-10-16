# Estrategia de pruebas

Este documento describe el stack de pruebas de UniLibrary, los principios que siguen las suites, el mapa de archivos de tests por capa, lo que no se cubre de forma automática y cómo ejecutarlas.

## Stack

- Vitest como runner y framework de aserciones (ver ADR-009).
- React Testing Library para renderizar componentes y páginas.
- user-event para simular interacciones reales del usuario.
- jest-dom para aserciones sobre el DOM.
- jsdom como entorno de navegador simulado.
- Cobertura con el provider v8, reportada en texto y HTML.

La configuración vive en el bloque test de `webdev-capstone/vite.config.ts` y el setup global en `webdev-capstone/tests/setup.ts`.

## Principios

- Consultas centradas en el usuario: se prefiere buscar por rol, texto y etiqueta accesible (getByRole, getByLabelText, findByText) sobre selectores de implementación.
- Probar comportamiento, no implementación: los tests verifican lo que el usuario ve y las llamadas a las fronteras externas, no el estado interno de los componentes.
- Simular solo en las fronteras:
  - fetch para los servicios de Open Library.
  - El módulo cliente de Supabase (`webdev-capstone/src/services/supabase/client.ts`) para los servicios de Supabase.
  - El módulo de servicio (`webdev-capstone/src/services/supabase/library.ts`) para contextos y hooks.
  - Proveedores de contexto falsos para las páginas.
- Los tests nunca dependen de variables de entorno, credenciales ni acceso a red.
- Los nombres de los tests describen el comportamiento en español.

## Mapa de archivos de prueba

| Archivo | Capa | Qué verifica |
|---|---|---|
| `webdev-capstone/tests/utils/loans.test.ts` | Unitaria | Utilidades de préstamos: normalización de work keys, vencimiento, días hasta el vencimiento y aviso de vencimiento próximo. |
| `webdev-capstone/tests/utils/sortBooks.test.ts` | Unitaria | Ordenamiento del catálogo por título, autor, año y calificación, con valores faltantes al final y sin mutar la entrada. |
| `webdev-capstone/tests/services/openLibrary.test.ts` | Servicio | Servicios de Open Library: construcción de la consulta de búsqueda, mapeo de documentos a libros, caché del cliente, manejo de errores HTTP y mapeo del detalle de obra. |
| `webdev-capstone/tests/services/libraryService.test.ts` | Servicio | Servicio de biblioteca sobre Supabase: consultas y orden, mapeo de filas snake_case al dominio, payloads de inserción, RPC de devolución y disponibilidad, y traducción de códigos de error de Postgres. |
| `webdev-capstone/tests/hooks/useLoanedWorkKeys.test.tsx` | Hook | Transición de carga a datos, estado de error cuando el servicio falla y descarte de la respuesta de una consulta anterior. |
| `webdev-capstone/tests/contexts/AuthContext.test.tsx` | Contexto | Estado de carga hasta la primera sesión, mapeo del usuario, normalización del email, traducción de errores de login y registro, y cancelación de la suscripción. |
| `webdev-capstone/tests/contexts/LibraryContext.test.tsx` | Contexto | Carga de préstamos, reservas y biblioteca por usuario, estado de error, recarga selectiva tras mutaciones, propagación de errores del servicio y búsquedas de préstamos activos. |
| `webdev-capstone/tests/pages/LoginPage.test.tsx` | Página | Formulario de login: validación de campos sin llamar al servicio y redirección a la página protegida tras iniciar sesión. |
| `webdev-capstone/tests/pages/RegisterPage.test.tsx` | Página | Formulario de registro: validación de campos, error de cuenta existente y redirección a la página protegida. |
| `webdev-capstone/tests/components/RequireAuth.test.tsx` | Componente | Estado de carga de sesión, redirección a login recordando el origen y render del contenido protegido. |
| `webdev-capstone/tests/components/BookCard.test.tsx` | Componente | Tarjeta de libro: metadatos y textos por defecto, enlace al detalle, badge de disponibilidad, portada diferida y ambas vistas. |
| `webdev-capstone/tests/pages/MyLoansPage.test.tsx` | Integración de página | Mis préstamos: estados de carga y error con reintento, indicadores de vencimiento, devolución, cancelación de reservas, reservas cumplidas, historial y estados vacíos. |
| `webdev-capstone/tests/pages/BookDetailPage.test.tsx` | Integración de página | Detalle del libro: sesión anónima, pedir prestado, reservar, devolver, errores de acción y de carga con reintento, selector de estado de lectura y error de disponibilidad. |
| `webdev-capstone/tests/pages/CatalogPage.test.tsx` | Integración de página | Catálogo: carga de destacados, disponibilidad por tarjeta, búsqueda con Enter, debounce, error con reintento y resultados vacíos. |

Las fábricas de contextos falsos usadas por las páginas viven en `webdev-capstone/tests/helpers.tsx`, que no es un archivo de prueba. Su funcionamiento se explica en `docs/quality/test-helpers.md`.

## Lo que no se cubre de forma automática

Las reglas que viven en Postgres no se pueden probar con tests de frontend:

- Las políticas Row Level Security de las tablas loans, reservations y library_entries.
- Las funciones SQL return_loan (devolución y cumplimiento atómico de la reserva más antigua) y loaned_work_keys (disponibilidad entre usuarios).

Estas reglas se verifican manualmente con dos cuentas sobre el proyecto de Supabase:

1. La cuenta A pide prestado un libro.
2. La cuenta B ve el libro como Prestado en el catálogo y en el detalle.
3. La cuenta B reserva el libro.
4. La cuenta A devuelve el libro.
5. La cuenta B ve su reserva como cumplida (Disponible para ti) en Mis préstamos.

## Cómo ejecutar

```bash
npm test
npm run test:run
npm run coverage
```

npm test abre Vitest en modo watch, npm run test:run ejecuta la suite una vez y npm run coverage la ejecuta con el reporte de cobertura v8.

## Cobertura medida

Resumen global obtenido con npm run coverage sobre la suite completa (89 pruebas en 14 archivos):

| Métrica | Cobertura |
|---|---|
| Sentencias | 82.78 % |
| Ramas | 75.77 % |
| Funciones | 77.6 % |
| Líneas | 86.27 % |

Las capas con mayor cobertura son las utilidades, los componentes de tarjetas y badges, y el hook de disponibilidad. La cobertura más baja está en las páginas auxiliares del catálogo (paginación, barra de herramientas y sidebar de filtros) y en las ramas del servicio de Supabase que solo se ejercitan contra la base de datos real.
