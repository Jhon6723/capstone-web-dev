# Helpers de pruebas

Este documento explica el archivo `webdev-capstone/tests/helpers.tsx`, que reúne las fábricas de datos falsos y utilidades compartidas por las pruebas. Se centra en dos ideas: el patrón de overrides que usan las fábricas de contextos y la función deferred para controlar promesas.

El archivo no es una prueba. Vitest solo ejecuta archivos cuyo nombre termina en .test o .spec, por lo que helpers.tsx únicamente existe para ser importado por los tests.

## Contenido del archivo

| Exportación | Qué es | Dónde se usa |
|---|---|---|
| testUser | Un usuario de ejemplo con sesión iniciada | Valor por defecto de makeAuth |
| daysFromNow | Fecha ISO relativa a hoy, en días | Pruebas cuyo componente usa la hora actual |
| makeBook | Fábrica de un libro del catálogo | Pruebas de tarjetas y páginas del catálogo |
| makeLoan | Fábrica de un préstamo | Pruebas de utilidades, contextos y páginas |
| makeReservation | Fábrica de una reserva | Pruebas de páginas de préstamos |
| makeAuth | Fábrica de un AuthContext falso | Pruebas de páginas y componentes que llaman a useAuth |
| makeLibrary | Fábrica de un LibraryContext falso | Pruebas de páginas que llaman a useLibrary |
| deferred | Promesa que se resuelve o rechaza manualmente | Pruebas de condiciones de carrera asíncronas |

## El problema que resuelven las fábricas

Las páginas reciben sus dependencias por contexto. Para renderizar una página en una prueba hay que entregarle un valor de contexto completo, y TypeScript exige todas sus propiedades. LibraryContextValue tiene catorce, entre listas, estado y acciones.

Sin una fábrica, cada prueba tendría que escribir las catorce propiedades aunque solo le importe una. Eso hace que las pruebas sean largas y que su intención quede escondida entre datos irrelevantes.

Con la fábrica, cada prueba escribe solo lo que define su escenario:

```tsx
const library = makeLibrary({ status: "error" });
```

La línea se lee como el escenario: la carga de la biblioteca falló.

## testUser

```ts
export const testUser: PublicUser = {
    id: "u1",
    name: "Ana",
    email: "ana@correo.com",
    createdAt: "2026-01-01T00:00:00Z",
};
```

Es una constante con la forma de PublicUser. Representa a una usuaria con sesión iniciada y es el valor por defecto de la propiedad user en makeAuth.

## El patrón de overrides

makeAuth y makeLibrary siguen el mismo patrón. Se explica con tres conceptos de JavaScript que, combinados, producen el comportamiento.

### Concepto 1: el operador spread copia propiedades

Los tres puntos dentro de un objeto copian todas las propiedades de otro objeto:

```ts
const a = { x: 1, y: 2 };
const b = { ...a, z: 3 };
// b = { x: 1, y: 2, z: 3 }
```

### Concepto 2: si una propiedad se repite, gana la última

Un objeto no puede tener dos propiedades con el mismo nombre. Cuando se escriben dos veces, la que aparece más abajo reemplaza a la anterior. Combinado con el spread:

```ts
const base = { color: "rojo", talla: "M" };
const cambios = { color: "azul" };

const resultado = { ...base, ...cambios };
// resultado = { color: "azul", talla: "M" }
```

JavaScript construye el objeto en orden:

```text
1. ...base     → { color: "rojo", talla: "M" }
2. ...cambios  → color ya existe y se reemplaza por "azul"
```

La propiedad talla se conserva porque cambios no la menciona. Esa es la regla que aprovechan las fábricas: se cambia solo lo que se menciona y el resto queda igual.

El orden importa. Si se invierte, los valores base pisan a los cambios y el cambio se pierde:

```ts
const resultado = { ...cambios, ...base };
// resultado = { color: "rojo", talla: "M" }
```

Por eso en las fábricas el spread de overrides va siempre al final.

### Concepto 3: parámetro con valor por defecto

```ts
function saludar(nombre = "amigo") {
    return `Hola ${nombre}`;
}

saludar("Ana"); // "Hola Ana"
saludar();      // "Hola amigo"
```

En las fábricas, el parámetro overrides tiene como valor por defecto un objeto vacío. Hacer spread de un objeto vacío no agrega nada, así que llamar a la fábrica sin argumentos devuelve solo los valores por defecto.

### El tipo Partial

```ts
export function makeLibrary(overrides: Partial<LibraryContextValue> = {}): LibraryContextValue
```

Partial es un tipo utilitario de TypeScript que vuelve opcionales todas las propiedades de otro tipo. No existe al ejecutar el código; solo afecta la verificación de tipos.

Si el parámetro fuera de tipo LibraryContextValue, habría que pasar las catorce propiedades en cada llamada y la fábrica perdería su sentido. Con Partial se pueden pasar pocas propiedades y TypeScript sigue validando nombres y valores:

```ts
makeLibrary({ status: "error" });      // válido
makeLibrary({ status: "lo que sea" }); // error: no es un status válido
makeLibrary({ statsu: "error" });      // error: la propiedad no existe
```

El valor de retorno sí es LibraryContextValue completo, porque los valores por defecto cubren todas las propiedades.

### makeAuth

```ts
export function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
    return {
        user: testUser,
        loading: false,
        login: vi.fn().mockResolvedValue({ ok: true }),
        register: vi.fn().mockResolvedValue({ ok: true }),
        logout: vi.fn(),
        ...overrides,
    };
}
```

Los valores por defecto describen el escenario más común: hay una usuaria con sesión, la comprobación de sesión ya terminó y las operaciones de autenticación salen bien.

| Llamada | Escenario |
|---|---|
| makeAuth() | Ana tiene sesión iniciada |
| makeAuth({ user: null }) | No hay sesión |
| makeAuth({ loading: true }) | Todavía se está comprobando la sesión |

### makeLibrary

```ts
export function makeLibrary(overrides: Partial<LibraryContextValue> = {}): LibraryContextValue {
    return {
        status: "ready",
        loans: [],
        reservations: [],
        entries: [],
        reload: vi.fn().mockResolvedValue(undefined),
        borrow: vi.fn().mockResolvedValue({ ok: true }),
        // ... resto de acciones con el mismo valor
        activeLoanFor: vi.fn(() => undefined),
        pendingReservationFor: vi.fn(() => undefined),
        entryFor: vi.fn(() => undefined),
        ...overrides,
    };
}
```

Los valores por defecto describen a un usuario sin actividad:

| Propiedad | Valor por defecto | Significado |
|---|---|---|
| status | "ready" | La biblioteca ya cargó |
| loans, reservations, entries | listas vacías | No hay préstamos, reservas ni estados de lectura |
| borrow, reserve, returnLoan y demás acciones | mock que resuelve { ok: true } | Toda acción sale bien |
| activeLoanFor, pendingReservationFor, entryFor | mock que devuelve undefined | No se encuentra nada para ningún libro |

Ejemplos de escenarios construidos con overrides:

```ts
makeLibrary({ status: "error" });
makeLibrary({ loans: [prestamoVencido] });
makeLibrary({
    borrow: vi.fn().mockResolvedValue({ ok: false, error: "Este libro ya está prestado." }),
});
makeLibrary({ activeLoanFor: vi.fn(() => prestamo) });
```

### Por qué las acciones son mocks

Cada acción es una función creada con vi.fn, que registra cuántas veces se llamó y con qué argumentos. Eso permite verificar qué hizo la página sin ejecutar ninguna operación real:

```tsx
const library = makeLibrary();
// render de la página con library y clic en "Pedir prestado"
expect(library.borrow).toHaveBeenCalledWith(expect.objectContaining({ workKey: "OL1W" }));
```

La prueba guarda el valor en una variable antes de entregarlo al proveedor, para poder consultar después los mismos mocks que recibió la página.

### Uso con los proveedores

```tsx
<AuthContext.Provider value={makeAuth()}>
    <LibraryContext.Provider value={makeLibrary()}>
        <MemoryRouter initialEntries={["/books/OL1W"]}>
            {/* rutas */}
        </MemoryRouter>
    </LibraryContext.Provider>
</AuthContext.Provider>
```

La página llama a useAuth y useLibrary sin saber que recibe valores falsos. Es inyección de dependencias: las pruebas reemplazan los proveedores reales, que se conectan a Supabase, por objetos controlados.

## Fábricas de entidades

Además de los contextos, el archivo reúne las fábricas de los objetos del dominio que se repiten en varias pruebas. Siguen el mismo patrón de overrides: valores por defecto razonables, spread al final y parámetro de tipo Partial.

### Valores por defecto

| Fábrica | Valores por defecto |
|---|---|
| makeBook | workKey /works/OL1W, título "El libro", dos autores, coverId 42, año 1990, sin subjects |
| makeLoan | id "l1", libro con workKey OL1W, prestado el 2026-01-01, vence el 2026-01-15, sin devolución, estado active |
| makeReservation | id "r1", libro con workKey OL1W, creada el 2026-01-01, estado pending, sin notificación |
| daysFromNow | Fecha ISO a N días de hoy (negativo para el pasado) |

### Fechas fijas y fechas relativas

Las fábricas usan fechas fijas porque son determinísticas: el mismo test produce el mismo dato en cada ejecución. Esto alcanza cuando la función bajo prueba recibe la fecha como parámetro, como los tests de `webdev-capstone/tests/utils/loans.test.ts`, que pasan un now fijo a isOverdue y daysUntilDue.

Pero algunas páginas llaman a new Date() por dentro. MyLoansPage compara cada préstamo con la hora real para mostrar los indicadores Vencido y Vence pronto. Si el test usara una fecha fija de enero, hoy todo aparecería como vencido. Para esos casos existe daysFromNow:

```ts
makeLoan({ id: "vencido", borrowedAt: daysFromNow(-10), dueAt: daysFromNow(-2) });
```

La línea se lee como el escenario: un préstamo tomado hace diez días que venció hace dos.

## Qué no va en helpers

Una fábrica o utilidad va en helpers.tsx solo cuando la necesita más de un archivo de test. Cuando un archivo es su único usuario, se queda en ese archivo, porque queda visible al leer el test y porque un cambio en helpers afecta a toda la suite.

- makeBuilder solo vive en `webdev-capstone/tests/services/libraryService.test.ts`, porque simula el constructor de consultas encadenado de Supabase (from().select().eq()) que solo usa ese archivo.
- jsonResponse solo vive en `webdev-capstone/tests/services/openLibrary.test.ts`, porque simula una respuesta de fetch y solo ese archivo simula fetch.
- El objeto esperado de fetchLoans en libraryService.test.ts se escribe literal, aunque sería tentador armarlo con makeLoan: el test verifica que el mapeo de filas produzca exactamente ese objeto, y construir el valor esperado con la misma fábrica compararía la fábrica consigo misma.

## deferred

### Cómo funciona una promesa normal

Una promesa representa un valor que llegará más adelante. Se crea con una función que recibe dos funciones, resolve y reject:

```ts
const promesa = new Promise((resolve, reject) => {
    // cuando el trabajo termina bien: resolve(valor)
    // si falla: reject(error)
});
```

Llamar a una de ellas es lo que termina la promesa. Como resolve y reject solo existen dentro de esa función, la promesa decide por sí misma cuándo terminar.

### El problema en las pruebas

Algunas pruebas necesitan controlar el orden exacto en que terminan varias operaciones asíncronas. El caso típico es una condición de carrera:

```text
1. Se inicia la consulta A
2. Antes de que A responda, se inicia la consulta B
3. B responde primero
4. A responde después
5. La interfaz debe mostrar el resultado de B, no el de A
```

Con temporizadores reales el orden no es confiable y las pruebas se vuelven lentas o intermitentes. Se necesita una forma de decidir desde la prueba cuándo termina cada promesa.

### La solución: sacar resolve y reject de la promesa

```ts
export function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
```

Paso a paso:

1. Se declaran dos variables vacías fuera de la promesa.
2. new Promise ejecuta su función inmediatamente. Dentro, las funciones res y rej se guardan en las variables de afuera, sin llamarlas.
3. Se devuelven la promesa pendiente y las dos funciones que la terminan.

El resultado funciona como un control remoto: la promesa queda pendiente hasta que la prueba decide terminarla.

```ts
const d = deferred<string>();

d.promise.then((valor) => console.log("llegó:", valor));
// la promesa sigue pendiente

d.resolve("hola");
// imprime: llegó: hola
```

Para simular un fallo se usa d.reject(new Error("falló")).

### Detalles de TypeScript

- El genérico T define qué tipo de valor entregará la promesa. Con deferred<Set<string>>(), llamar a resolve con un texto produce un error de tipos.
- La anotación (value: T) => void describe una función que recibe un T y no devuelve nada.
- El signo de exclamación en let resolve! es una aserción de asignación definitiva. TypeScript no puede saber que la función de new Promise se ejecuta de inmediato, y se quejaría de que resolve podría usarse sin valor. La aserción le indica que la variable siempre tendrá valor antes de usarse, lo cual es cierto porque new Promise ejecuta su función en el momento de crearse.

### Ejemplo: descartar una respuesta obsoleta

La prueba de condición de carrera de `webdev-capstone/tests/hooks/useLoanedWorkKeys.test.tsx` importa deferred desde helpers.tsx:

```ts
const first = deferred<Set<string>>();
const second = deferred<Set<string>>();
fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

const { result, rerender } = renderHook(({ keys }) => useLoanedWorkKeys(keys), {
    initialProps: { keys: ["OL1W"] },
});
rerender({ keys: ["OL2W"] });

await act(async () => second.resolve(new Set(["OL2W"])));
await act(async () => first.resolve(new Set(["OL1W"])));

expect(result.current.loaned).toEqual(new Set(["OL2W"]));
```

| Paso | Qué ocurre |
|---|---|
| Crear first y second | Dos promesas pendientes. El mock del servicio devuelve first en la primera llamada y second en la segunda. |
| renderHook con OL1W | El hook consulta OL1W y recibe first, que queda pendiente. |
| rerender con OL2W | El hook marca la consulta anterior como obsoleta y consulta OL2W, que recibe second. |
| second.resolve | Llega la respuesta nueva y el hook la muestra. |
| first.resolve | Llega la respuesta vieja, tarde a propósito, como ocurriría con una red lenta. |
| expect | El hook sigue mostrando OL2W porque ignoró la respuesta obsoleta. |

act le indica a React que dentro ocurren cambios de estado y que debe procesarlos antes de continuar. Sin act, la aserción podría ejecutarse antes de que React actualice el resultado.

El mecanismo que protege al hook se documenta en `docs/architecture/async-patterns.md`.

## Resumen

| Concepto | Qué es | Para qué sirve |
|---|---|---|
| overrides | Objeto con los cambios deseados, copiado al final con spread | Construir contextos falsos completos cambiando solo lo que define cada escenario |
| Partial | Tipo que vuelve opcionales todas las propiedades | Permitir overrides parciales sin perder la validación de tipos |
| deferred | Promesa con resolve y reject accesibles desde afuera | Controlar el orden exacto de las respuestas asíncronas y probar condiciones de carrera |
