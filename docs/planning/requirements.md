# Requisitos Funcionales y No Funcionales

Semana 1 - Planificación y Análisis de Requisitos

## Requisitos funcionales

### RF1 - Navegación de libros

- RF1.1: La aplicación debe mostrar un catálogo de libros obtenido desde la Open Library API.
- RF1.2: Cada libro del catálogo debe mostrar portada, título, autor y estado de disponibilidad.
- RF1.3: La aplicación debe permitir paginar el catálogo para manejar conjuntos de datos grandes.

### RF2 - Búsqueda y filtrado

- RF2.1: La aplicación debe permitir buscar libros por título, autor o palabras clave.
- RF2.2: La aplicación debe permitir filtrar el catálogo por categorías (subjects de Open Library).
- RF2.3: La aplicación debe permitir ordenar los resultados por fecha de publicación, autor o popularidad.
- RF2.4: La búsqueda y el filtrado deben manejar de forma eficiente conjuntos de datos grandes (paginación y debounce).

### RF3 - Sistema de préstamos

- RF3.1: La aplicación debe permitir a un usuario tomar prestado un libro disponible.
- RF3.2: La aplicación debe registrar la fecha de préstamo y calcular una fecha de vencimiento.
- RF3.3: La aplicación debe permitir reservar un libro que se encuentra actualmente prestado.
- RF3.4: La aplicación debe almacenar el historial de préstamos del usuario de forma persistente en Local Storage.
- RF3.5: La aplicación debe mostrar los préstamos activos con su fecha de vencimiento.

### RF4 - Página de detalles del libro

- RF4.1: La aplicación debe tener una página dedicada para cada libro con su información detallada (portada, título, autor, descripción, género, disponibilidad).
- RF4.2: La página de detalles debe incluir un rastreador de estado de lectura con los estados Leyendo, Completado y Lista de deseos.

### RF5 - Lista de deseos (avanzada, opcional)

- RF5.1: La aplicación debe permitir crear y gestionar una lista de deseos de libros.
- RF5.2: La aplicación debe notificar al usuario cuando un libro de la lista de deseos esté disponible para préstamo.

### RF6 - Autenticación de usuarios

- RF6.1: La aplicación debe permitir a un usuario iniciar sesión y cerrar sesión.
- RF6.2: La sesión del usuario debe persistir entre recargas de página.
- RF6.3: Los datos de préstamos, historial, lista de deseos y estado de lectura deben estar asociados al usuario activo.

### RF7 - Diseño responsivo

- RF7.1: La aplicación debe usar un enfoque mobile-first.
- RF7.2: La aplicación debe ser usable en dispositivos móviles, tabletas y escritorio.

### RF8 - Accesibilidad

- RF8.1: La aplicación debe permitir la navegación completa mediante teclado.
- RF8.2: La aplicación debe usar roles ARIA apropiados en los componentes interactivos.
- RF8.3: La aplicación debe tener contraste y tipografía legibles.

### RF9 - Construcción y despliegue

- RF9.1: La aplicación debe generar un build de producción optimizado con Vite.
- RF9.2: La aplicación debe configurar entornos de desarrollo y producción mediante archivos .env con el prefijo VITE_.
- RF9.3: La aplicación debe desplegarse en una plataforma Serverless o PaaS.

## Requisitos no funcionales

### RNF1 - Rendimiento

- RNF1.1: La aplicación debe implementar carga perezosa (lazy loading) para imágenes de portadas.
- RNF1.2: La aplicación debe implementar carga perezosa de rutas (code splitting por ruta).
- RNF1.3: La aplicación debe usar debounce en la búsqueda para evitar solicitudes excesivas a la API.
- RNF1.4: La aplicación debe cachear respuestas de la API cuando sea posible para reducir solicitudes repetidas.

### RNF2 - Seguridad

- RNF2.1: La aplicación debe validar y sanitizar todas las entradas del usuario para prevenir ataques XSS.
- RNF2.2: La aplicación debe usar HTTPS en producción.
- RNF2.3: La aplicación debe implementar autenticación de usuarios con mecanismos seguros.
- RNF2.4: La aplicación debe validar los formularios del lado del cliente para envíos seguros y libres de errores.

### RNF3 - Mantenibilidad

- RNF3.1: El código debe estar escrito en TypeScript con tipado estricto.
- RNF3.2: El código debe seguir una estructura de carpetas clara y consistente.
- RNF3.3: Los componentes deben ser reutilizables y con baja acoplación.

### RNF4 - Usabilidad

- RNF4.1: La interfaz debe ser visualmente atractiva e intuitiva.
- RNF4.2: La aplicación debe dar feedback visual para acciones del usuario (carga, errores, vacío).

### RNF5 - Compatibilidad

- RNF5.1: La aplicación debe funcionar en los navegadores modernos (Chrome, Firefox, Edge, Safari).

### RNF6 - Escalabilidad de datos

- RNF6.1: El manejo de datos del catálogo debe soportar conjuntos grandes sin degradar la experiencia (paginación y renderizado eficiente).

## Matriz de trazabilidad con requisitos del capstone

| Requisito capstone | Requisitos del proyecto |
|---|---|
| 1. Navegación de libros | RF1 |
| 2. Búsqueda y filtrado | RF2 |
| 3. Sistema de préstamos | RF3 |
| 4. Página de detalles del libro | RF4 |
| 5. Lista de deseos | RF5 |
| 6. Diseño responsivo | RF7 |
| 7. UI y accesibilidad | RF8, RNF4 |
| 8. Optimización del rendimiento | RNF1 |
| 9. Medidas de seguridad | RNF2 |
| 10. Construcción y despliegue | RF9 |
