# Investigación y Selección de Servicio Backend

Semana 6 - Refactorización de autenticación y persistencia

## Contexto

En la semana 6 se decide incorporar un backend externo para la autenticación y el manejo de la API. El capstone permite elegir entre Local Storage o un servicio backend (ej., Firebase, Supabase) para la persistencia. La implementación actual usa Local Storage (ADR-004), con autenticación simulada en el cliente: los usuarios y el hash de contraseñas viven en el navegador, lo que no constituye un mecanismo seguro real (RNF2.3).

Esta investigación evalúa servicios externos gestionados (Backend as a Service) para reemplazar la autenticación simulada y la persistencia local, con prioridad en curva de aprendizaje rápida y facilidad de integración con una SPA de React + TypeScript desplegada como sitio estático.

## Alcance del backend en UniLibrary

El servicio seleccionado debe cubrir:

- Registro, inicio y cierre de sesión con tokens.
- Persistencia por usuario: préstamos, reservas, historial, lista de deseos y estado de lectura (RF3, RF4.2, RF5, RF6.3).
- Seguridad del lado del servidor: los datos de un usuario no deben ser legibles ni modificables por otro usuario (RNF2.3).
- HTTPS por defecto en todas las comunicaciones (RNF2.2).

No está en alcance: el catálogo de libros sigue siendo Open Library API (ADR-001), y no se requiere un backend para el despliegue del frontend, que sigue siendo un sitio estático (RF9.3).

## Servicios candidatos

### Supabase

- Sitio: https://supabase.com
- Tipo: BaaS sobre PostgreSQL. Auth, base de datos relacional, API REST automática (PostgREST) y políticas Row Level Security.
- SDK: @supabase/supabase-js. Una sola dependencia para auth y datos.
- Modelo de datos: SQL relacional con esquema explícito. Encaja con la relación usuario → préstamos/reservas/wishlist.
- Seguridad: RLS con políticas SQL por tabla. El token JWT de sesión identifica al usuario y Postgres aplica las políticas en cada consulta.
- Costo: plan Free con 500 MB de base de datos, 50.000 usuarios activos mensuales y 2 proyectos activos.
- Consideración operativa: los proyectos Free se pausan tras 1 semana de inactividad. Se restauran desde el dashboard hasta 1 año después, y la actividad normal durante el desarrollo evita la pausa.
- Nombrado explícitamente como opción en la especificación del capstone.

### Firebase

- Sitio: https://firebase.google.com
- Tipo: BaaS de Google. Authentication + Cloud Firestore (NoSQL, documentos).
- SDK: firebase (modular). Una sola dependencia para auth y datos.
- Modelo de datos: documentos JSON en colecciones, sin esquema. Los datos por usuario se modelan como subcolecciones (users/{uid}/loans).
- Seguridad: Firebase Security Rules, un lenguaje de expresiones propio (basado en CEL) que evalúa auth.uid en cada operación.
- Costo: plan Spark sin método de pago: 1 GiB almacenado, 50.000 lecturas y 20.000 escrituras diarias, 50.000 usuarios activos mensuales.
- No pausa proyectos por inactividad.
- Ecosistema de tutoriales muy amplio, incluido contenido en español.
- Nombrado explícitamente como opción en la especificación del capstone.

### Clerk

- Sitio: https://clerk.com
- Tipo: servicio especializado en autenticación. Componentes React preconstruidos.
- Limitación: no incluye base de datos para préstamos, reservas ni lista de deseos. Requeriría integrar un segundo servicio para la persistencia, duplicando la configuración.

### Appwrite

- Sitio: https://appwrite.io
- Tipo: BaaS open source con auth y base de datos.
- Limitación: comunidad y material de aprendizaje más reducidos que Firebase y Supabase. Menos directo para un primer contacto con BaaS.

### PocketBase

- Tipo: backend en un solo binario (Go + SQLite).
- Limitación: es autohospedado. Requeriría desplegar y mantener el servidor, sumando trabajo de infraestructura que no aporta al objetivo de integración rápida.

## Comparación

| Criterio | Supabase | Firebase | Clerk | Appwrite |
|---|---|---|---|---|
| Auth email/contraseña | Sí | Sí | Sí | Sí |
| Persistencia de datos | Postgres + REST automática | Firestore | No | Sí |
| Seguridad server-side | RLS en SQL | Security Rules (CEL) | N/A | Permisos por colección |
| SDK | supabase-js | firebase | clerk-react | appwrite |
| Lenguaje del modelo | SQL (estándar) | Documentos JSON | N/A | Documentos |
| Un solo servicio cubre auth + datos | Sí | Sí | No | Sí |
| Pausa por inactividad (free) | Sí (7 días, restaurable) | No | No | Depende del hosting |
| Nombrado en la especificación | Sí | Sí | No | No |
| Tipado TypeScript | Bueno, con generación de tipos | Bueno | Bueno | Moderado |

## Decisión propuesta

Se propone **Supabase** como servicio backend.

### Justificación

- Un único servicio cubre autenticación y persistencia. Auth emite sesiones JWT gestionadas por el SDK, y la misma sesión autoriza las consultas de datos.
- El modelo relacional encaja con el dominio: usuarios, préstamos, reservas, lista de deseos y estado de lectura son entidades relacionadas, no documentos aislados.
- Row Level Security aplica las reglas de acceso en Postgres del lado del servidor, cumpliendo RNF2.3 con un mecanismo real y demostrable (cada usuario solo ve sus filas).
- SQL es un lenguaje estándar ya usado en otros cursos, por lo que la curva de aprendizaje se concentra en el SDK y en las políticas RLS, no en un modelo de datos nuevo.
- La especificación del capstone lo nombra como opción y el despliegue del frontend no cambia: Supabase es un servicio consumido por HTTPS desde la SPA.
- El SDK provee onAuthStateChange para reaccionar a cambios de sesión, equivalente al restoreUser actual de AuthContext, lo que acota el refactor a la capa de servicios.

### Riesgo identificado

El plan Free pausa el proyecto tras 7 días de inactividad. Mitigaciones: el proyecto estará activo durante el desarrollo, Supabase avisa por correo antes de pausar, el proyecto se restaura desde el dashboard en minutos y un restablecimiento puede hacerse antes de la entrega o demostración. Se acepta este riesgo a cambio del modelo relacional y RLS.

### Alternativa

Firebase es la alternativa más cercana: integración comparable, sin pausa por inactividad y con abundante material en español. Se descarta como primera opción porque su modelo de documentos y su lenguaje de Security Rules son menos familiares que SQL, y porque las relaciones del dominio (usuario → préstamos → libros) se expresan de forma más natural en tablas. Si Supabase presenta fricción durante la implementación, Firebase es el plan B con impacto acotado a la capa de servicios.

## Integración prevista

La refactorización se concentra en la capa de servicios sin tocar las páginas ni los componentes:

```text
Ahora:                        Con Supabase:
AuthContext                   AuthContext
  └→ storage service            └→ supabase.auth (login, registro, logout, sesión)
       (localStorage)               └→ sesión JWT persistida por el SDK
Library Context               Library Context
  └→ storage service            └→ supabase.from(tabla) con RLS
       (localStorage)               └→ consultas autorizadas por el JWT
```

- Variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env, reutilizando el mecanismo ya definido en ADR-005 (RF9.2).
- La clave anon está diseñada para ser pública: la seguridad real la aplican las políticas RLS. La clave service_role nunca se incluye en el frontend.
- Tablas previstas: profiles, loans, reservations, wishlist, reading_status; cada una con políticas RLS limitadas al usuario autenticado.
- La sesión del SDK se persiste automáticamente en el navegador, reemplazando el session manual de localStorage.

## Decisiones a actualizar tras la implementación

- ADR-004 (persistencia: Local Storage) debe revisarse a Supabase y documentar el motivo del cambio.
- El diagrama de arquitectura Nivel 2 debe agregar Supabase como container externo.
- La tabla del stack tecnológico finalizado debe reflejar el cambio de persistencia.
