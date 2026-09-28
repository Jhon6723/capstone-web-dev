# Alcance, Objetivos y Entregables

Semana 1 - Planificación y Análisis de Requisitos

## Nombre del proyecto

UniLibrary - SPA de gestión y exploración de libros para una biblioteca universitaria.

## Visión

Construir una Aplicación de Página Única (SPA) rápida y responsiva que permita a los usuarios explorar el catálogo de una biblioteca universitaria, ver detalles de los libros, buscarlos, filtrarlos y gestionar préstamos y una lista de deseos. La aplicación demostrará principios modernos de desarrollo frontend: diseño responsivo, gestión de estado, reactividad, integración de API, accesibilidad y optimización de rendimiento.

## Objetivos

1. Construir una SPA con React y TypeScript que consuma la API pública de Open Library.
2. Ofrecer navegación, búsqueda, filtrado y ordenamiento del catálogo de libros.
3. Implementar un sistema de préstamos con seguimiento de fechas de vencimiento y reservas.
4. Proveer una página de detalles por libro con rastreador de estado de lectura.
5. Implementar una lista de deseos opcional con notificaciones de disponibilidad.
6. Garantizar una experiencia responsiva con enfoque mobile-first y accesibilidad (navegación por teclado, roles ARIA).
7. Optimizar el rendimiento con carga perezosa de imágenes y recursos.
8. Aplicar medidas de seguridad: validación y sanitización de entradas, HTTPS, autenticación de usuarios y validación de formularios.
9. Configurar entornos de desarrollo y producción y desplegar en una plataforma Serverless o PaaS.

## Alcance

### Dentro del alcance (In-scope)

- Catálogo de libros obtenido en tiempo real desde la Open Library API.
- Búsqueda por título, autor y palabras clave.
- Filtrado por categorías (subjects) y ordenamiento por fecha de publicación, autor y popularidad.
- Página de detalles del libro con portada, título, autor, descripción, género y estado de disponibilidad.
- Sistema de préstamos: tomar prestado, reservar, historial y fechas de vencimiento.
- Rastreador de estado de lectura (Leyendo, Completado, Lista de deseos).
- Lista de deseos con notificaciones de disponibilidad.
- Autenticación básica de usuarios (inicio y cierre de sesión).
- Persistencia local de préstamos, historial, lista de deseos y estado de lectura mediante Local Storage.
- Diseño responsivo mobile-first con accesibilidad por teclado y roles ARIA.
- Carga perezosa de imágenes y optimización de rendimiento.
- Despliegue en una plataforma Serverless o PaaS.

### Fuera del alcance (Out-of-scope)

- Backend propio: la persistencia se realiza en Local Storage, no en una base de datos remota.
- Préstamos físicos reales o integración con sistemas de biblioteca existentes.
- Sincronización de datos entre dispositivos (los datos viven en el navegador del usuario).
- Catálogo cargado desde Google Books API (se evalúa Open Library como única fuente).
- Pagos, suscripciones o cualquier funcionalidad comercial.
- Aplicación móvil nativa (se entrega una SPA web responsiva).

## Suposiciones

- La Open Library API mantiene disponibilidad y límites de uso suficientes para una demostración académica.
- Los datos de disponibilidad de cada libro se simulan a partir de la información pública de la API, ya que Open Library no gestiona préstamos reales de la biblioteca universitaria.
- La autenticación de usuarios es básica (local, sin proveedor externo) y suficiente para el alcance académico.

## Restricciones

- Lenguaje: TypeScript.
- Framework: React.
- Enrutamiento: React Router DOM.
- Persistencia: Local Storage (sin backend).
- El proyecto debe entregarse dentro del cronograma de 7 semanas del capstone.

## Entregables clave

| Entrega | Semana | Descripción |
|---|---|---|
| Planificación y requisitos | 1 | Alcance, objetivos, requisitos funcionales y no funcionales, selección de API y stack. |
| Diseño y arquitectura | 2 | Diagramas arquitectónicos, modelo de datos y maquetas UI/UX. |
| Características principales | 3 | Navegación, visualización, búsqueda, filtrado y ordenamiento. |
| Características de usuario | 4 | Detalles del libro, autenticación, préstamos y revisión a mitad de proyecto. |
| Características avanzadas | 5 | Lista de deseos, rastreador de lectura y persistencia local. |
| Pruebas y QA | 6 | Pruebas unitarias y de integración, corrección de errores y optimización. |
| Despliegue y cierre | 7 | Despliegue, documentación y entrega final. |

## Criterios de éxito

- La SPA carga el catálogo desde la Open Library API y permite búsqueda, filtrado y ordenamiento de forma fluida.
- El sistema de préstamos permite tomar prestados libros, reservarlos y consultar fechas de vencimiento, con historial persistente en Local Storage.
- La aplicación es responsiva y usable en móvil y escritorio.
- La navegación es accesible por teclado y usa roles ARIA.
- La aplicación pasa pruebas unitarias y de integración y se despliega correctamente en una plataforma Serverless o PaaS.
