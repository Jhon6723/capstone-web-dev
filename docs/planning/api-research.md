# Investigación y Selección de API

Semana 1 - Planificación y Análisis de Requisitos

## APIs candidatas

### Open Library API

- Sitio: https://openlibrary.org/developers/api
- Autenticación: no requerida.
- Formato: JSON.
- Cobertura: obras, ediciones, autores y subjects de Open Library.
- Límites: 1 solicitud por segundo por defecto; 3 solicitudes por segundo si se envía un header User-Agent con nombre de aplicación y email de contacto.
- Costo: gratuito.

### Google Books API

- Sitio: https://developers.google.com/books
- Autenticación: requiere API key.
- Formato: JSON.
- Cobertura: metadatos enriquecidos (descripciones, calificaciones, vistas previas).
- Límites: cuota diaria con API key.
- Costo: gratuito con cuota.

## Comparación

| Criterio | Open Library | Google Books |
|---|---|---|
| Autenticación | No requerida | Requiere API key |
| Campos de disponibilidad | Sí (availability) | No nativo |
| Subjects (categorías) | Sí, vía Subjects API | Limitado (categories) |
| Portadas | Covers API por OLID/ISBN | thumbnails incluidos |
| Límites | 1-3 req/s | Cuota diaria |
| Adecuado para préstamos simulados | Sí | No |
| Configuración | Mínima | Gestión de claves |

## Decisión

Se selecciona la **Open Library API** como fuente única del catálogo.

### Justificación

- No requiere autenticación ni gestión de claves, lo que simplifica la configuración de entornos y el despliegue.
- Expone un campo de availability que permite simular el estado de disponibilidad de los libros, necesario para el sistema de préstamos.
- La Subjects API permite filtrar el catálogo por categorías, cubriendo el requisito de filtrado por categorías.
- La Covers API permite obtener portadas en distintos tamaños (S, M, L), útil para la carga perezosa y el diseño responsivo.
- Sus límites de uso (1-3 solicitudes por segundo) son suficientes para una demostración académica con debounce y caché del lado del cliente.

## Endpoints a utilizar

### Search API

Obtiene resultados de búsqueda de libros, autores y obras.

```
GET https://openlibrary.org/search.json
```

Parámetros principales:

| Parámetro | Descripción |
|---|---|
| q | Consulta de búsqueda (título, autor, palabras clave). |
| fields | Campos a devolver. Usar el valor especial availability para incluir datos de disponibilidad. |
| limit | Cantidad de resultados por página. |
| page | Número de página. |
| sort | Ordenamiento (ej., old, new, rating, editions). |

Ejemplo:

```
GET https://openlibrary.org/search.json?q=harry+potter&fields=*,availability&limit=20&page=1
```

### Covers API

Obtiene portadas de libros y fotos de autores por OLID, ISBN, OCLC, LCCN o ID de portada.

```
GET https://covers.openlibrary.org/b/{key}/{value}-{size}.jpg
```

- key: isbn, oclc, lccn, olid o id.
- size: S (small), M (medium) o L (large).

Ejemplo:

```
GET https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg
```

### Works API

Obtiene la información detallada de una obra por su OLID.

```
GET https://openlibrary.org/works/{OLID}.json
```

Ejemplo:

```
GET https://openlibrary.org/works/OL166894W.json
```

### Subjects API

Obtiene libros por nombre de subject (categoría).

```
GET https://openlibrary.org/subjects/{subject}.json
```

Ejemplo:

```
GET https://openlibrary.org/subjects/fiction.json
```

## Campos relevantes del catálogo

| Campo | Origen | Uso en la app |
|---|---|---|
| key / olid | Search / Works | Identificador del libro y enlace a detalles. |
| title | Search | Título del libro. |
| author_name | Search | Autor del libro. |
| cover_i | Search | ID de portada para la Covers API. |
| isbn | Search | ISBN para portadas alternativas. |
| first_publish_year | Search | Ordenamiento por fecha. |
| ratings_average | Search | Ordenamiento por popularidad. |
| subject | Search / Subjects | Filtrado por categorías. |
| description | Works | Descripción en la página de detalles. |
| availability | Search (con fields=availability) | Estado de disponibilidad para préstamos. |

## Consideraciones de uso

- Enviar un header User-Agent con el nombre de la aplicación y un email de contacto para obtener el límite de 3 solicitudes por segundo.
- Cachear respuestas del lado del cliente para reducir solicitudes repetidas.
- Usar debounce en la búsqueda para evitar llamadas excesivas.
- Implementar paginación con limit y page para no solicitar el catálogo completo.
- Manejar errores y respuestas vacías con feedback visual al usuario.
