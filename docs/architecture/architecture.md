# Arquitectura del Frontend

Semana 2 - Diseño y Arquitectura

Documento de arquitectura de alto nivel de UniLibrary usando el modelo C4. Los diagramas estan escritos en Mermaid (sintaxis C4*) y se renderizan directamente en GitHub.

## Nivel 1 - System Context

El sistema es una SPA que el usuario usa desde el navegador. Consume la API publica de Open Library para el catalogo. El Local Storage del navegador (persistencia) es parte del sistema y aparece en el nivel Container.

```mermaid
C4Context
    title System Context - UniLibrary

    Person(user, "Usuario", "Estudiante o personal que explora el catalogo, presta y reserva libros")

    System(unilibrary, "UniLibrary", "SPA para explorar el catalogo, gestionar prestamos, reservas, estado de lectura y lista de deseos")

    System_Ext(openLibrary, "Open Library API", "API publica de catalogo de libros: Search, Works, Subjects, Covers")

    Rel(user, unilibrary, "Usa", "HTTPS")
    Rel(unilibrary, openLibrary, "Consulta catalogo y portadas", "HTTPS/JSON")
```

## Nivel 2 - Container

El sistema tiene un unico container de ejecucion (la SPA React en el navegador) y un container de persistencia proporcionado por el navegador (Local Storage). No hay backend propio.

```mermaid
C4Container
    title Container - UniLibrary

    Person(user, "Usuario", "Explora el catalogo y gestiona prestamos")

    Container_Boundary(unilibrary, "UniLibrary") {
        Container(spa, "Single-Page Application", "React, TypeScript, Vite, Tailwind CSS", "Corre en el navegador del usuario")
        ContainerDb(storage, "Local Storage", "Web Storage API", "Usuarios, sesion, prestamos, reservas, estado de lectura y lista de deseos")
    }

    System_Ext(openLibrary, "Open Library API", "Search, Works, Subjects, Covers")

    Rel(user, spa, "Usa", "HTTPS")
    Rel(spa, openLibrary, "Consulta catalogo", "HTTPS/JSON")
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
        Component(router, "App Router", "React Router DOM", "Rutas, parametros y lazy loading por ruta")

        Component(catalogPage, "Catalog Page", "React", "Busqueda, filtros, ordenamiento y paginacion")
        Component(bookPage, "Book Detail Page", "React", "Detalle, prestamo/reserva y estado de lectura")
        Component(loansPage, "My Loans Page", "React", "Prestamos activos e historial")
        Component(wishlistPage, "Wishlist Page", "React", "Lista de deseos y notificaciones")
        Component(authPages, "Auth Pages", "React", "Login y registro con validacion")

        Component(authContext, "Auth Context", "React Context", "Sesion y autenticacion")
        Component(catalogContext, "Catalog Context", "React Context", "Consulta, filtros y resultados")
        Component(libraryContext, "Library Context", "React Context", "Prestamos, reservas, lectura, wishlist")

        Component(apiClient, "Open Library Client", "Fetch API", "Debounce, cache y manejo de errores")
        Component(storageService, "Storage Service", "Web Storage API", "Serializacion y claves versionadas")
        Component(loanService, "Loan Service", "TypeScript", "Reglas de prestamo, reserva y vencimiento")
    }

    Rel(user, router, "Navega")
    Rel(router, catalogPage, "/")
    Rel(router, bookPage, "/books/:workKey")
    Rel(router, loansPage, "/loans")
    Rel(router, wishlistPage, "/wishlist")
    Rel(router, authPages, "/login, /register")

    Rel(catalogPage, catalogContext, "Lee/actualiza")
    Rel(bookPage, libraryContext, "Lee/actualiza")
    Rel(loansPage, libraryContext, "Lee")
    Rel(wishlistPage, libraryContext, "Lee/actualiza")
    Rel(authPages, authContext, "Login/registro")

    Rel(catalogContext, apiClient, "Search y Subjects")
    Rel(bookPage, apiClient, "Works y Covers")
    Rel(authContext, storageService, "Usuarios y sesion")
    Rel(libraryContext, storageService, "Prestamos y biblioteca")
    Rel(libraryContext, loanService, "Reglas de dominio")
    Rel(loanService, apiClient, "Verifica disponibilidad")

    Rel(apiClient, openLibrary, "HTTPS/JSON")
    Rel(storageService, storage, "Web Storage API")
```

## Decisiones estructurales

### Tres contextos por dominio

El estado se divide en tres contextos con responsabilidades acotadas, en lugar de un unico contexto global. Esto evita re-renders innecesarios: la pagina de catalogo no se re-renderiza cuando cambia un prestamo, y viceversa.

| Contexto | Responsabilidad |
|---|---|
| Auth Context | Usuario activo, login, registro, logout, sesion persistida. |
| Catalog Context | Consulta de busqueda, filtros activos, ordenamiento, resultados y paginacion. |
| Library Context | Prestamos, reservas, historial, estado de lectura y lista de deseos del usuario. |

### Capa de servicios desacoplada de la UI

Los componentes nunca llaman a fetch ni a localStorage directamente. Toda interaccion externa pasa por tres servicios:

| Servicio | Responsabilidad |
|---|---|
| Open Library Client | Peticiones HTTP con debounce, cache en memoria, header User-Agent identificado y manejo de errores. |
| Storage Service | Serializacion JSON, claves versionadas (unilibrary:v1:*) y manejo de errores de cuota. |
| Loan Service | Reglas de negocio de prestamos y reservas, calculo de fechas de vencimiento. |

### Disponibilidad simulada

Open Library no gestiona prestamos reales de la biblioteca universitaria. El Loan Service deriva la disponibilidad combinando el campo availability de la Search API con el estado local de prestamos de la aplicacion.

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
    CatalogContext.tsx
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

Los diagramas usan la sintaxis C4 de Mermaid (C4Context, C4Container, C4Component). Se renderizan automaticamente al ver este archivo en GitHub o en editores con soporte Mermaid (VS Code con la extension Markdown Preview Mermaid Support, por ejemplo).
