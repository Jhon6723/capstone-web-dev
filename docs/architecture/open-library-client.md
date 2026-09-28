# Cliente de Open Library

Semana 3 - Características principales

Notas de implementación del cliente de Open Library (`webdev-capstone/src/services/open-library/`). Para la selección de la API, endpoints y límites de uso ver `docs/planning/api-research.md`.

## Construcción del parámetro q

La función buildQuery de `src/services/open-library/books.ts` arma el parámetro q de la Search API a partir del texto de búsqueda y las categorías seleccionadas en la UI.

### Escenario de ejemplo

El usuario escribe harry potter en el buscador y marca las categorías Ficción e Historia en el sidebar de filtros.

Paso 1 — buildQuery arma el string de q:

```
buildQuery("harry potter", ["fiction", "history"])
```

Como hay dos categorías, los filtros se agrupan con OR entre paréntesis:

```
subjects.map((subject) => `subject:${subject}`).join(" OR ")
-> "subject:fiction OR subject:history"
-> "(subject:fiction OR subject:history)"
```

Luego se unen las partes no vacías con un espacio:

```
["harry potter", "(subject:fiction OR subject:history)"].filter(Boolean).join(" ")
-> "harry potter (subject:fiction OR subject:history)"
```

Paso 2 — searchBooks lo envía en la URL:

URLSearchParams codifica el valor y la request final queda:

```
GET https://openlibrary.org/search.json
    ?q=harry+potter+%28subject%3Afiction+OR+subject%3Ahistory%29
    &fields=key,title,author_name,cover_i,first_publish_year,subject,ratings_average,ebook_access
    &limit=20
    &page=1
```

Paso 3 — Open Library interpreta la sintaxis:

La Search API acepta consultas fielded (estilo Solr):

- harry potter es texto libre que busca en título, autor y contenido.
- subject:fiction filtra por campo: solo documentos cuyo subject sea fiction.
- El espacio entre términos actúa como AND implícito: texto y filtro se deben cumplir a la vez.
- El OR explícito dentro de paréntesis agrupa alternativas.

Semántica final: libros que coinciden con harry potter y cuyo subject es fiction o history.

### Casos de buildQuery

| Entrada | clause | q final |
|---|---|---|
| ("dune", []) | "" | dune (texto solo) |
| ("dune", ["fiction"]) | subject:fiction | dune subject:fiction |
| ("dune", ["fiction", "science"]) | (subject:fiction OR subject:science) | dune (subject:fiction OR subject:science) |
| ("", ["history"]) | subject:history | subject:history (solo filtro) |

### Detalles de diseño

- filter(Boolean) elimina los strings vacíos antes del join. Sin él, ("", ["history"]) produciría " subject:history" con un espacio inicial, y ("dune", []) quedaría "dune " con espacio final. Es la forma de juntar solo las partes que existen.
- Los paréntesis en el OR son necesarios: sin ellos, dune subject:fiction OR subject:science puede interpretarse como (dune AND fiction) OR science, devolviendo todos los libros de ciencia aunque no tengan relación con el texto buscado. Los paréntesis garantizan texto AND (fiction OR science), acotando el filtro dentro de la búsqueda de texto.
