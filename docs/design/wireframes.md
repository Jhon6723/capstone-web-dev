# Maquetas UI/UX

Semana 2 - Diseño y Arquitectura

Maquetas de las paginas clave de UniLibrary. La referencia visual principal es el wireframe de la pagina de catalogo; el resto de paginas se especifican en texto para mantener consistencia con ese estilo (alto contraste, marcos simples, badges de estado).

## Mapa de navegación

```mermaid
flowchart TD
    H[/Home - Catalogo/] --> BD[/Book Detail/]
    H --> L[/My Loans/]
    H --> W[/Wishlist/]
    H --> C[/Contacto/]
    H --> LI[/Login/]
    LI --> RG[/Register/]
    BD -->|pedir prestado / reservar| L
    W -->|marcar disponible| BD
```

| Ruta | Pagina | Requiere sesion |
|---|---|---|
| / | Catalogo (Home) | No |
| /books/:workKey | Detalle del libro | No (prestamo/reserva si) |
| /loans | Mis Prestamos | Si |
| /wishlist | Lista de Deseos | Si |
| /contact | Contacto | No |
| /login | Iniciar Sesion | No |
| /register | Registrarse | No |

## Pagina de Catalogo (Home)

![Wireframe de la pagina de catalogo](wireframes/catalog-page.png)

Elementos identificados en la maqueta:

| Zona | Elementos |
|---|---|
| Header | Navegacion: Inicio, Mis Prestamos, Lista de Deseos, Contacto. Acciones: Iniciar Sesion, Registrarse. Con sesion activa los botones se reemplazan por el nombre del usuario y Cerrar sesion. |
| Titulo | Catalogo de Biblioteca. |
| Busqueda | Input Buscar por titulo, autor o ISBN... + boton Buscar. Aplica debounce en escritura ademas del submit. |
| Categorias rapidas | Pills: Todos, Ficcion, Ciencia, Historia, Tecnologia, Arte, Derecho. Mapean a subjects de Open Library. |
| Sidebar de filtros | CATEGORIA (checkboxes), ORDENAR POR (dropdown Relevancia + radios Autor A-Z, Fecha reciente, Popularidad, Titulo A-Z), boton Limpiar filtros. |
| Resultados | Texto Mostrando X-Y de N resultados para consulta + toggle de vista Grilla/Lista. |
| Tarjeta de libro | Portada, titulo, autor y ano, badge de disponibilidad (Disponible/Prestado), boton Ver detalle, icono corazon para wishlist. |

### Comportamiento responsivo (mobile-first)

- En movil el sidebar de filtros colapsa en un boton Filtros que abre un drawer/modal.
- Las pills de categorias pasan a scroll horizontal.
- La grilla de resultados pasa de 3 columnas (desktop) a 2 (tablet) y 1 (movil).
- El header colapsa la navegacion en un menu hamburguesa.

## Detalle del libro (/books/:workKey)

| Zona | Contenido |
|---|---|
| Columna izquierda | Portada grande (Covers API tamano L con lazy loading). |
| Columna derecha | Titulo, autor(es), ano de publicacion, generos (subjects como chips), descripcion (Works API), badge de disponibilidad. |
| Acciones | Boton Pedir prestado (si disponible) o Reservar (si prestado). Selector de estado de lectura: Leyendo / Completado / Lista de deseos. |
| Contexto | Enlace Volver al catalogo conservando filtros activos. |

## Mis Prestamos (/loans)

| Seccion | Contenido |
|---|---|
| Prestamos activos | Lista/tabla: portada pequena, titulo, fecha de prestamo, fecha de vencimiento con indicador visual (proximo a vencer / vencido), boton Devolver. |
| Reservas | Reservas pendientes con fecha de solicitud y estado. |
| Historial | Prestamos devueltos con rango de fechas. |

## Lista de Deseos (/wishlist)

- Lista de libros marcados con status wishlist: portada, titulo, autor, badge de disponibilidad.
- Notificacion inline cuando un libro de la lista pasa a disponible (banner o badge Nuevo disponible).
- Acciones por item: Ver detalle, Pedir prestado (si disponible), Quitar de la lista.

## Login y Registro (/login, /register)

- Formulario centrado con validacion de cliente: email con formato valido, contrasena con longitud minima, confirmacion de contrasena en registro.
- Errores de validacion junto a cada campo y mensajes accesibles (aria-describedby).
- Enlace cruzado entre login y registro.

## Contacto (/contact)

- Formulario simple: nombre, email, asunto, mensaje. Validacion de cliente y confirmacion de envio (almacenamiento local o stub).

## Lineamientos de accesibilidad aplicados a las maquetas

- Toda accion alcanzable por teclado: la grilla usa tarjetas con foco visible y orden de tabulacion logico.
- Landmarks: header con nav, aside para filtros, main para resultados.
- El toggle Grilla/Lista usa aria-pressed; los badges de disponibilidad no dependen solo del color (texto Disponible/Prestado).
- Formularios con label asociado a cada input y aria-live para mensajes de error y conteo de resultados.
