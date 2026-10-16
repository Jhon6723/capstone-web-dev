# Decisiones de Arquitectura (ADR)

Registro de decisiones tomadas durante la planificación del proyecto UniLibrary. Cada entrada documenta la decisión, su contexto y justificación.

## Estado de las decisiones

| ID      | Decisión                                                              | Estado                  |
| ------- | --------------------------------------------------------------------- | ----------------------- |
| ADR-001 | Usar Open Library API como fuente del catálogo                        | Aceptada                |
| ADR-002 | Usar React Context API para la gestión de estado                      | Aceptada                |
| ADR-003 | Usar Tailwind CSS para el estilizado                                  | Aceptada                |
| ADR-004 | Usar Local Storage para la persistencia de datos                      | Reemplazada por ADR-007 |
| ADR-005 | Usar Vite como herramienta de build y desarrollo                      | Aceptada                |
| ADR-006 | Usar React Router DOM para el enrutamiento                            | Aceptada                |
| ADR-007 | Usar Supabase como servicio backend para autenticación y persistencia | Aceptada                |
| ADR-008 | Disponibilidad multiusuario y reglas de préstamo en la base de datos  | Aceptada                |
| ADR-009 | Usar Vitest y React Testing Library para las pruebas                  | Aceptada                |
| ADR-010 | Desplegar en Vercel                                                   | Aceptada                |

---

## ADR-001 - Fuente del catálogo: Open Library API

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

El capstone requiere obtener el catálogo de libros desde una API pública. Las opciones evaluadas fueron Open Library API y Google Books API.

### Decisión

Usar la Open Library API como fuente única del catálogo.

### Justificación

No requiere autenticación, expone campos de disponibilidad para simular préstamos, ofrece Subjects API para el filtrado por categorías y una Covers API para portadas en distintos tamaños. Sus límites de uso son suficientes para una demostración académica con debounce y caché. Ver detalles en `docs/planning/api-research.md`.

### Consecuencias

- No se requiere gestionar claves de API ni variables de entorno para la fuente de datos.
- El estado de disponibilidad se simula a partir del campo ebook_access de la Search API y del estado local de préstamos de la aplicación.
- Se debe respetar el límite de solicitudes aplicando caché y debounce. El navegador no permite personalizar el header User-Agent desde fetch, por lo que aplica el límite base de 1 solicitud por segundo.

---

## ADR-002 - Gestión de estado: React Context API

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

El capstone permite elegir entre React Context API y Redux Toolkit para la gestión de estado.

### Decisión

Usar React Context API con hooks personalizados.

### Justificación

El estado de la aplicación (usuario activo, préstamos, historial, lista de deseos y estado de lectura) es moderado y se agrupa en pocos dominios. Context API es suficiente, no agrega dependencias y mantiene el código simple. Redux Toolkit añadiría boilerplate innecesario para este alcance.

### Consecuencias

- Se definen contextos separados por dominio (auth, loans, wishlist, reading-status).
- Se exponen los estados y acciones mediante hooks personalizados para mantener una API limpia en los componentes.

---

## ADR-003 - Estilizado: Tailwind CSS

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

El capstone permite elegir entre CSS Modules, styled-components o una biblioteca de componentes (Material-UI, Chakra UI).

### Decisión

Usar Tailwind CSS.

### Justificación

Tailwind facilita un enfoque mobile-first y responsivo mediante utilidades, acelera la construcción de la UI y mantiene los estilos junto al marcado sin archivos de estilos separados. Es ligero en producción gracias a la purga de clases no usadas.

### Consecuencias

- Se configura Tailwind CSS v4 mediante el plugin oficial @tailwindcss/vite, sin PostCSS ni archivo tailwind.config.
- El diseño responsivo se expresa con los breakpoints de Tailwind (sm, md, lg, xl).
- La accesibilidad (roles ARIA, foco por teclado) se complementa con utilidades de foco y visibilidad de Tailwind.

### Revisión (Semana 3)

La consecuencia original indicaba configurar Tailwind con PostCSS en el pipeline de Vite. Tailwind CSS v4 ya no usa PostCSS ni archivo de configuración: se integra con el plugin @tailwindcss/vite y la directiva @import "tailwindcss" en la hoja de estilos. Se actualiza la consecuencia para reflejar la integración real.

---

## ADR-004 - Persistencia: Local Storage

- Estado: Reemplazada por ADR-007
- Fecha: Semana 1

### Contexto

El capstone permite elegir entre Local Storage o un servicio backend (Firebase, Supabase) para la persistencia.

### Decisión

Usar Local Storage.

### Justificación

El alcance académico no requiere sincronización entre dispositivos ni multiusuario real. Local Storage cumple el requisito mínimo de persistencia, no requiere backend y simplifica el despliegue. Los datos se asocian al usuario activo mediante una clave compuesta por su identificador.

### Consecuencias

- Los datos viven en el navegador del usuario y no se sincronizan entre dispositivos.
- Se implementa una capa de acceso a Local Storage con serialización y manejo de errores.
- Se debe considerar la limpieza de datos y el límite de tamaño de Local Storage.

### Revisión (Semana 6)

Esta decisión queda reemplazada por ADR-007. En la semana 6 se decide incorporar un backend para la autenticación y el manejo de la API, ya que la autenticación simulada en el cliente no cumple el requisito de mecanismos seguros de autenticación (RNF2.3). La evaluación de servicios se documenta en `docs/planning/backend-research.md`.

---

## ADR-005 - Herramienta de build: Vite

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

Se necesita una herramienta de build y desarrollo para el proyecto React con TypeScript.

### Decisión

Usar Vite.

### Justificación

Vite ofrece un servidor de desarrollo rápido con recarga en caliente, soporta TypeScript y React sin configuración extra, y genera builds optimizados para producción. Se integra con Tailwind CSS v4 mediante el plugin oficial @tailwindcss/vite (ver ADR-003).

### Consecuencias

- Se usa la plantilla oficial de Vite para React con TypeScript.
- Los entornos de desarrollo y producción se gestionan con archivos .env y el prefijo VITE_.

---

## ADR-006 - Enrutamiento: React Router DOM

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

El capstone especifica React Router DOM como opción de enrutamiento.

### Decisión

Usar React Router DOM en su versión estable actual.

### Justificación

Es la opción indicada por el capstone y la solución estándar de enrutamiento para SPAs en React. Soporta rutas anidadas, parámetros de ruta (necesarios para la página de detalles del libro) y carga perezosa de rutas para el code splitting.

### Consecuencias

- Se definen rutas para catálogo, detalles del libro, préstamos, lista de deseos y autenticación.
- Se usa lazy loading por ruta para optimizar el rendimiento.

---

## ADR-007 - Servicio backend: Supabase

- Estado: Aceptada
- Fecha: Semana 6

### Contexto

En la semana 6 se decide implementar un backend externo para la autenticación y el manejo de la API. La implementación actual usa Local Storage (ADR-004) con autenticación simulada en el cliente: los usuarios y el hash de las contraseñas viven en el navegador, por lo que no hay verificación real del lado del servidor ni protección entre usuarios.

El capstone permite elegir entre Local Storage o un servicio backend (ej., Firebase, Supabase). Se evaluaron Supabase, Firebase, Clerk, Appwrite y PocketBase priorizando curva de aprendizaje rápida y facilidad de integración. Ver `docs/planning/backend-research.md`.

### Decisión

Usar Supabase como servicio backend para la autenticación de usuarios y la persistencia de los datos de usuario (préstamos, reservas, historial, lista de deseos y estado de lectura).

### Justificación

- Un único servicio cubre autenticación y base de datos, integrándose con una sola dependencia (@supabase/supabase-js) y dos variables de entorno.
- Auth emite sesiones JWT que el SDK gestiona y persiste automáticamente en el navegador, reemplazando la sesión manual actual.
- El modelo relacional encaja con el dominio: usuarios, préstamos, reservas, lista de deseos y estado de lectura son entidades relacionadas.
- Row Level Security aplica las reglas de acceso en Postgres del lado del servidor, cumpliendo RNF2.3 con un mecanismo real y demostrable.
- SQL es un lenguaje estándar y familiar, por lo que la curva de aprendizaje se concentra en el SDK y en las políticas RLS.
- Supabase está nombrado en la especificación del capstone y el despliegue del frontend no cambia: se consume por HTTPS como servicio externo.
- El refactor queda acotado a la capa de servicios: AuthContext delega en supabase.auth y los contextos de biblioteca en consultas a las tablas, sin tocar páginas ni componentes.

### Consecuencias

- Se crean tablas para los datos de usuario con políticas RLS que limitan cada fila a su propietario.
- Se configuran las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en los archivos .env (RF9.2). La clave anon es pública por diseño; la clave service_role nunca se incluye en el frontend.
- La sesión la gestiona el SDK de Supabase, no un registro propio en Local Storage.
- El catálogo sigue viniendo de Open Library (ADR-001); Supabase no interviene en esa fuente.
- Los proyectos del plan Free se pausan tras 7 días de inactividad. Se acepta el riesgo documentado en la investigación: el proyecto se mantiene activo durante el desarrollo y puede restaurarse desde el dashboard.
- Se actualiza la arquitectura Nivel 2 para incluir Supabase como sistema externo.

---

## ADR-008 - Disponibilidad multiusuario y reglas de préstamo en la base de datos

- Estado: Aceptada
- Fecha: Semana 6

### Contexto

La primera versión del modelo de préstamos asumía un solo usuario por navegador: la disponibilidad se simulaba con el campo ebook_access de Open Library y las reglas de negocio (un préstamo activo por libro, reservas, devolución) se aplicaban en el cliente. Con Supabase ya hay múltiples usuarios reales sobre la misma base de datos (ADR-007), por lo que esas reglas deben vivir del lado del servidor para que sean consistentes entre usuarios y no dependan de un cliente confiable.

### Decisión

Modelar UniLibrary con un ejemplar por libro y mover las reglas de préstamo a Postgres:

- Un libro está Prestado si existe un préstamo activo de cualquier usuario. La disponibilidad se consulta con la función security definer loaned_work_keys, que recibe una lista de work keys y devuelve solo las que tienen préstamo activo, sin exponer quién lo tiene.
- La devolución se ejecuta con la función return_loan, que marca el préstamo como devuelto y cumple la reserva pendiente más antigua del libro en la misma transacción.
- Las tablas loans y reservations usan grants a nivel de columna: el cliente solo puede insertar el user_id y el snapshot del libro, mientras estado y fechas los asigna la base de datos.
- Las reservas solo se permiten sobre libros prestados por otro usuario, regla aplicada con una política RLS de inserción.
- La tabla library_entries guarda el estado de lectura y la lista de deseos por usuario y libro.
- El campo ebook_access de Open Library deja de definir la disponibilidad en la aplicación.

### Justificación

- Un índice único parcial sobre loans con status active garantiza un solo préstamo activo por libro aunque dos clientes intenten pedirlo al mismo tiempo.
- La función security definer permite consultar disponibilidad de todos los usuarios sin abrir la tabla loans a lectura entre usuarios: expone únicamente work keys.
- Hacer la devolución y el cumplimiento de la reserva en una sola función evita estados intermedios inconsistentes.
- Los grants por columna impiden que un cliente modifique status o extienda su propia fecha de vencimiento, reforzando RNF2.3.
- ebook_access describe formatos digitales en Open Library, no el inventario de UniLibrary; la disponibilidad real solo la conocen los préstamos de la aplicación.

### Consecuencias

- La disponibilidad del catálogo y del detalle se calcula por página de resultados con una llamada RPC por conjunto de work keys.
- El cliente no puede registrar devoluciones ni cambiar estados directamente: toda mutación pasa por RPC o por políticas RLS.
- Limitación conocida: una reserva cumplida no aparta el libro; cuando queda disponible, lo toma prestado el primer usuario que lo solicite.
- La implementación SQL vive en `webdev-capstone/supabase/schema.sql` y `webdev-capstone/supabase/002_multiuser_library.sql`.

---

## ADR-009 - Pruebas: Vitest y React Testing Library

- Estado: Aceptada
- Fecha: Semana 6

### Contexto

El curso presenta Jest como framework de pruebas para React. El proyecto usa Vite como herramienta de build y desarrollo (ADR-005), con módulos ESM, TypeScript y variables de entorno expuestas por import.meta.env.

### Decisión

Usar Vitest como runner y framework de aserciones, y React Testing Library con user-event y jest-dom para las pruebas de componentes y páginas. La cobertura se mide con el provider v8.

### Justificación

- Vitest reutiliza la configuración y el pipeline de transformación de Vite, por lo que ESM, TypeScript e import.meta.env funcionan en las pruebas igual que en la aplicación sin configurar Babel ni ts-jest.
- Su API es compatible con la de Jest (describe, it, expect y vi.fn como análogo de jest.fn), por lo que los conceptos del curso se transfieren directamente.
- React Testing Library impulsa pruebas centradas en el usuario, consultando por roles, textos y etiquetas accesibles en lugar de detalles de implementación.
- La configuración de pruebas vive en el mismo archivo de configuración de Vite (`webdev-capstone/vite.config.ts`), lo que reduce la superficie de tooling del proyecto.

### Consecuencias

- Vitest y las bibliotecas de Testing Library se declaran como dependencias de desarrollo, no de producción.
- Los archivos de prueba viven en `webdev-capstone/tests/` junto con el setup global y las fábricas compartidas.
- La estrategia completa de pruebas (principios, mapa de archivos, cobertura y verificación manual de las reglas de Postgres) se documenta en `docs/quality/testing-strategy.md`.
- No se instala Jest: los ejemplos del curso se traducen a la API equivalente de Vitest.

---

## ADR-010 - Despliegue: Vercel

- Estado: Aceptada
- Fecha: Semana 7

### Contexto

UniLibrary es una SPA estática compilada con Vite que consume dos servicios externos: la Open Library API (pública) y Supabase (auth y datos). No hay un servidor propio que alojar, por lo que un despliegue estático con HTTPS es suficiente. El enrutador usa createBrowserRouter con rutas reales (/books/:workKey, /loans), así que la plataforma debe reescribir cualquier ruta a index.html para que las recargas y los enlaces profundos funcionen.

### Decisión

Desplegar en Vercel conectando el repositorio de GitHub. Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY se definen en el panel del proyecto de Vercel y se inyectan al compilar. `webdev-capstone/vercel.json` declara un rewrite de todas las rutas a /index.html.

### Justificación

- Vercel detecta proyectos Vite sin configuración adicional: el comando de build npm run build y el directorio de salida dist quedan correctos por defecto.
- HTTPS automático (requisito 9: transmisión segura de datos) y despliegue por push sin mantenimiento.
- Las anon keys de Supabase son públicas por diseño (la seguridad vive en las políticas RLS, no en la clave), por lo que exponerlas en el build no es un problema; las variables de entorno solo existen para no fijar el proyecto de Supabase en el código.
- El plan gratuito cubre el alcance académico.

### Consecuencias

- El root directory del proyecto en Vercel se configura como webdev-capstone.
- Cada push a la rama principal dispara un despliegue de producción; las ramas generan previews.
- Si la plataforma cambiara, el equivalente en Netlify es un archivo _redirects con la misma regla.

---

## Stack tecnológico finalizado

| Componente           | Tecnología                                 |
| -------------------- | ------------------------------------------ |
| Lenguaje             | TypeScript                                 |
| Framework frontend   | React                                      |
| Herramienta de build | Vite                                       |
| Gestión de estado    | React Context API                          |
| Estilizado           | Tailwind CSS                               |
| Integración de API   | Fetch API                                  |
| Enrutamiento         | React Router DOM                           |
| Servicio backend     | Supabase (auth y persistencia por usuario) |
| Despliegue           | Vercel (ADR-010)                           |
