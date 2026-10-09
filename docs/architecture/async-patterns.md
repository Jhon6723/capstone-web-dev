# Patrones de respuestas desfasadas

Semana 6 - Backend y persistencia

Notas sobre la condición de carrera entre peticiones asíncronas y el render en React, y los dos patrones usados en el proyecto para resolverla. Implementación en `webdev-capstone/src/hooks/useLoanedWorkKeys.ts` y `webdev-capstone/src/contexts/LibraryContext.tsx`.

## El problema

Un useEffect lanza una petición asíncrona. Si las dependencias del efecto cambian antes de que llegue la respuesta, se lanza una segunda petición. Nada garantiza que las respuestas lleguen en el mismo orden en que se lanzaron.

Escenario de ejemplo en el catálogo:

```
t=0   Usuario ve página 1 → petición A (libros OL1W, OL2W)
t=1   Usuario pasa a página 2 → petición B (libros OL3W, OL4W)
t=2   Llega respuesta B → el estado muestra la página 2, correcto
t=3   Llega respuesta A (tarde) → sobrescribe el estado con datos viejos
```

En t=3 el usuario ve la página 2, pero el estado quedó con los datos de la página 1. La respuesta vieja se llama desfasada (stale response) y el efecto visible es contenido que parpadea o queda incorrecto.

La regla general: si un efecto puede ejecutarse varias veces antes de que termine la petición anterior, hay que identificar qué respuesta sigue siendo la actual y descartar las demás.

## Patrón 1 - Bandera stale

Usado en `src/hooks/useLoanedWorkKeys.ts`. Cada ejecución del efecto declara una variable local stale en false. El cleanup del efecto la pone en true cuando se desmonta el componente o cuando cambian las dependencias.

```ts
useEffect(() => {
    let stale = false;

    fetchLoanedWorkKeys(keys)
        .then((loaned) => {
            if (!stale) setResult({ loaned });
        })
        .catch(() => {
            if (!stale) setResult({ loaned: null, error: true });
        });

    return () => {
        stale = true;
    };
}, [joinedKeys, refreshKey]);
```

Por qué funciona:

- Cada ejecución del efecto crea su propia variable stale. Son independientes entre sí.
- Cuando las dependencias cambian, React ejecuta primero el cleanup de la ejecución anterior (stale = true) y luego el nuevo efecto.
- Si la respuesta vieja llega tarde, su stale ya es true y el if la descarta.

Es el patrón recomendado cuando solo interesa distinguir dos casos: esta petición sigue siendo la actual, o ya no.

## Patrón 2 - Contador de carga (loadIdRef)

Usado en `src/contexts/LibraryContext.tsx` para la función reload. Un useRef guarda el número de la última carga lanzada. Cada carga toma el siguiente número y, al responder, verifica que siga siendo el último.

```ts
const loadIdRef = useRef(0);

const reload = async () => {
    const loadId = ++loadIdRef.current;
    setStatus("loading");
    try {
        const data = await Promise.all([...]);
        if (loadId !== loadIdRef.current) return;  // llegó tarde
        setLoans(data);
        setStatus("ready");
    } catch {
        if (loadId !== loadIdRef.current) return;
        setStatus("error");
    }
};
```

Por qué funciona:

- useRef sobrevive entre renders sin provocar re-render al cambiar.
- ++loadIdRef.current asigna un número único creciente a cada carga.
- Si la respuesta de la carga 1 llega cuando ya se lanzó la carga 2, su loadId es menor que el contador actual y se descarta.

## Comparación

| | Bandera stale | Contador loadIdRef |
|---|---|---|
| Mecanismo | Cleanup del efecto marca la petición vieja | Contador compartido identifica la última |
| Ámbito | Dentro de un useEffect | Dentro de una función reusable (useCallback) |
| Cuándo conviene | Peticiones lanzadas directamente en efectos | Cargas lanzadas desde acciones o handlers fuera del efecto |
| Reutilización | La bandera nace y muere con el efecto | El contador sirve para cualquier llamada posterior |

Ambos resuelven la misma condición de carrera. La bandera encaja en efectos de "cargar cuando cambia X" como el hook de disponibilidad. El contador encaja mejor cuando la carga se dispara desde varios lugares (por ejemplo, reload se llama desde el efecto de cambio de usuario y podría llamarse de nuevo manualmente).

## Reglas de uso

- Toda petición lanzada desde un useEffect cuyas dependencias pueden cambiar con frecuencia (paginación, búsqueda, navegación) debe usar uno de los dos patrones.
- El cleanup con stale también cubre el desmontaje: evita el warning de React por actualizar estado de un componente desmontado.
- No confundir con cancelar la petición (AbortController). Estos patrones no cancelan el trabajo de red; solo ignoran la respuesta cuando llega tarde.
