# Decisiones de Arquitectura (ADR)

Registro de decisiones tomadas durante la planificación del proyecto UniLibrary. Cada entrada documenta la decisión, su contexto y justificación.

## Estado de las decisiones

| ID | Decisión | Estado |
|---|---|---|
| ADR-001 | Usar Open Library API como fuente del catálogo | Aceptada |
| ADR-002 | Usar React Context API para la gestión de estado | Aceptada |
| ADR-003 | Usar Tailwind CSS para el estilizado | Aceptada |
| ADR-004 | Usar Local Storage para la persistencia de datos | Aceptada |
| ADR-005 | Usar Vite como herramienta de build y desarrollo | Aceptada |
| ADR-006 | Usar React Router DOM para el enrutamiento | Aceptada |

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
- El estado de disponibilidad se simula a partir de los datos públicos de Open Library.
- Se debe respetar el límite de solicitudes enviando un header User-Agent y aplicando caché y debounce.

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

- Se configura Tailwind con PostCSS en el pipeline de Vite.
- El diseño responsivo se expresa con los breakpoints de Tailwind (sm, md, lg, xl).
- La accesibilidad (roles ARIA, foco por teclado) se complementa con utilidades de foco y visibilidad de Tailwind.

---

## ADR-004 - Persistencia: Local Storage

- Estado: Aceptada
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

---

## ADR-005 - Herramienta de build: Vite

- Estado: Aceptada
- Fecha: Semana 1

### Contexto

Se necesita una herramienta de build y desarrollo para el proyecto React con TypeScript.

### Decisión

Usar Vite.

### Justificación

Vite ofrece un servidor de desarrollo rápido con recarga en caliente, soporta TypeScript y React sin configuración extra, y genera builds optimizados para producción. Se integra de forma nativa con Tailwind CSS mediante PostCSS.

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

## Stack tecnológico finalizado

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Framework frontend | React |
| Herramienta de build | Vite |
| Gestión de estado | React Context API |
| Estilizado | Tailwind CSS |
| Integración de API | Fetch API |
| Enrutamiento | React Router DOM |
| Persistencia de datos | Local Storage |
| Despliegue | Por definir (Vercel, Netlify o AWS Amplify) |

La decisión de despliegue (ADR-007) se tomará en la Semana 7 al evaluar las plataformas disponibles y los requisitos de build de producción.
