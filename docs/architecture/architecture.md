# Arquitectura del Frontend

Semana 2 - Diseño y Arquitectura

Documento de arquitectura de alto nivel de UniLibrary usando el modelo C4. Los diagramas están escritos en Mermaid (sintaxis C4*) y se renderizan directamente en GitHub.

## Nivel 1 - System Context

El sistema es una SPA que el usuario usa desde el navegador. Consume la API pública de Open Library para el catálogo. El Local Storage del navegador (persistencia) es parte del sistema y aparece en el nivel Container.

```mermaid
C4Context
    title System Context - UniLibrary

    Person(user, "Usuario", "Estudiante o personal que explora el catálogo, presta y reserva libros")

    System(unilibrary, "UniLibrary", "SPA para explorar el catálogo, gestionar préstamos, reservas, estado de lectura y lista de deseos")

    System_Ext(openLibrary, "Open Library API", "API pública de catálogo de libros: Search, Works, Subjects, Covers")

    Rel(user, unilibrary, "Usa", "HTTPS")
    Rel(unilibrary, openLibrary, "Consulta catálogo y portadas", "HTTPS/JSON")
```

## Nivel 2 - Container

El sistema tiene un único container de ejecución (la SPA React en el navegador) y un container de persistencia proporcionado por el navegador (Local Storage). No hay backend propio.

```mermaid
C4Container
    title Container - UniLibrary

    Person(user, "Usuario", "Explora el catálogo y gestiona préstamos")

    Container_Boundary(unilibrary, "UniLibrary") {
        Container(spa, "Single-Page Application", "React, TypeScript, Vite, Tailwind CSS", "Corre en el navegador del usuario")
        ContainerDb(storage, "Local Storage", "Web Storage API", "Usuarios, sesión, préstamos, reservas, estado de lectura y lista de deseos")
    }

    System_Ext(openLibrary, "Open Library API", "Search, Works, Subjects, Covers")

    Rel(user, spa, "Usa", "HTTPS")
    Rel(spa, openLibrary, "Consulta catálogo", "HTTPS/JSON")
    Rel(spa, storage, "Lee y escribe", "Web Storage API")
```

## Nivel 3 - Component

Dentro de la SPA se identifican cuatro grupos: Router, Pages, State (Context API) y Services.

```mermaid
C4Component
    title Component - Single-Page Application

    Person(user, "Usuario")

    System_Ext(openLibrary, "Open Library API")
    ContainerDb(storage, "Local Storage", "Web Storage API")

    Container_Boundary(spa, "Single-Page Application") {
        Component(router, "App Router", "React Router DOM", "Rutas, parámetros y lazy loading por ruta")

        Component(catalogPage, "Catalog Page", "React", "Búsqueda, filtros, ordenamiento y paginación")
        Component(bookPage, "Book Detail Page", "React", "Detalle, préstamo/reserva y estado de lectura")
        Component(loansPage, "My Loans Page", "React", "Préstamos activos e historial")
        Component(wishlistPage, "Wishlist Page", "React", "Lista de deseos y notificaciones")
        Component(authPages, "Auth Pages", "React", "Login y registro con validación")

        Component(authContext, "Auth Context", "React Context", "Sesión y autenticación")
        Component(libraryContext, "Library Context", "React Context", "Préstamos, reservas, lectura, wishlist")

        Component(apiClient, "Open Library Client", "Fetch API", "Debounce, caché y manejo de errores")
        Component(storageService, "Storage Service", "Web Storage API", "Serialización y claves versionadas")
        Component(loanService, "Loan Service", "TypeScript", "Reglas de préstamo, reserva y vencimiento")
    }

    Rel(user, router, "Navega")
    Rel(router, catalogPage, "/")
    Rel(router, bookPage, "/books/:workKey")
    Rel(router, loansPage, "/loans")
    Rel(router, wishlistPage, "/wishlist")
    Rel(router, authPages, "/login, /register")

    Rel(bookPage, libraryContext, "Lee/actualiza")
    Rel(loansPage, libraryContext, "Lee")
    Rel(wishlistPage, libraryContext, "Lee/actualiza")
    Rel(authPages, authContext, "Login/registro")

    Rel(catalogPage, apiClient, "Search y Subjects")
    Rel(bookPage, apiClient, "Works y Covers")
    Rel(authContext, storageService, "Usuarios y sesión")
    Rel(libraryContext, storageService, "Préstamos y biblioteca")
    Rel(libraryContext, loanService, "Reglas de dominio")
    Rel(loanService, apiClient, "Verifica disponibilidad")

    Rel(apiClient, openLibrary, "HTTPS/JSON")
    Rel(storageService, storage, "Web Storage API")
```

## Decisiones estructurales

### Dos contextos por dominio

El estado compartido se divide en dos contextos con responsabilidades acotadas, en lugar de un único contexto global. Esto evita re-renders innecesarios: la página de catálogo no se re-renderiza cuando cambia un préstamo, y viceversa.

| Contexto | Responsabilidad |
|---|---|
| Auth Context | Usuario activo, login, registro, logout, sesión persistida. |
| Library Context | Préstamos, reservas, historial, estado de lectura y lista de deseos del usuario. |

El estado del catálogo (consulta, filtros, ordenamiento, resultados y paginación) es local a la Catalog Page: solo esa página lo lee y modifica, por lo que vive en useState dentro del componente y se pasa por props a sus hijos. Un contexto aquí no aportaba nada: no hay consumidores fuera de la página. Revisión aplicada en Semana 3.

### Capa de servicios desacoplada de la UI

Los componentes nunca llaman a fetch ni a localStorage directamente. Toda interacción externa pasa por tres servicios:

| Servicio | Responsabilidad |
|---|---|
| Open Library Client | Peticiones HTTP con debounce, caché en memoria, header User-Agent identificado y manejo de errores. |
| Storage Service | Serialización JSON, claves versionadas (unilibrary:v1:*) y manejo de errores de cuota. |
| Loan Service | Reglas de negocio de préstamos y reservas, cálculo de fechas de vencimiento. |

### Disponibilidad simulada

Open Library no gestiona préstamos reales de la biblioteca universitaria. El Loan Service deriva la disponibilidad combinando el campo availability de la Search API con el estado local de préstamos de la aplicación.

## Flujo de datos principal

```mermaid
flowchart LR
    subgraph SPA["Single-Page Application"]
        P[Pages] --> C[Contexts]
        C --> S1[Open Library Client]
        C --> S2[Storage Service]
        C --> S3[Loan Service]
        S3 --> S1
    end
    S1 -->|HTTPS/JSON| OL[Open Library API]
    S2 -->|Web Storage| LS[Local Storage]
    U[Usuario] --> P
```

## Estructura de carpetas propuesta

```
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  pages/
    catalog/
    book-detail/
    loans/
    wishlist/
    auth/
  components/
    ui/
    books/
    layout/
  contexts/
    AuthContext.tsx
    LibraryContext.tsx
  hooks/
  services/
    open-library/
    storage/
    loans/
  types/
  utils/
  styles/
```

## Nota sobre los diagramas

Los diagramas usan la sintaxis C4 de Mermaid (C4Context, C4Container, C4Component). Se renderizan automáticamente al ver este archivo en GitHub o en editores con soporte Mermaid (VS Code con la extensión Markdown Preview Mermaid Support, por ejemplo).
