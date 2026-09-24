# Contexto para cualquier LLM — EmprendeLink DPS941

> Copia este documento completo al inicio de una conversación con ChatGPT, Claude, Copilot u otro asistente si ese asistente no puede leer el repositorio. Si puede leer archivos del repo, indícale que lea primero `AGENTS.md`, `README.md` y los documentos de `docs/`.

## Proyecto

Estoy trabajando en **EmprendeLink**, proyecto de cátedra de DPS941. La etapa actual es **Etapa 2 — Desarrollo Base Web**.

EmprendeLink es una plataforma para microemprendedores que permite administrar negocio, catálogo, productos, pedidos, clientes, planes, comisiones y reportes.

## Stack congelado

- Node.js 24.21.0 LTS.
- Next.js 16.3.3 Active LTS.
- React 19.2.7 fijado por estabilidad del equipo.
- Firebase JS SDK 12.18.0.
- JavaScript, no TypeScript.
- Next.js App Router.
- CSS global + CSS Modules.
- Context API + custom hooks.
- npm.
- VS Code.
- Vercel.

AdminLTE React 0.6.1, Bootstrap 5.3.8 y Bootstrap Icons 1.13.1 están aprobados para paneles internos. No agregues otras dependencias ni cambies versiones sin aprobación explícita del equipo.

## Arquitectura obligatoria

```text
UI / componentes
      ↓
hooks / context / lógica
      ↓
services / Route Handlers
      ↓
Firebase / Firestore u origen de datos acordado
```

No accedas directamente a Firestore desde componentes visuales y no coloques reglas complejas de negocio dentro del JSX.

## Roles

Usa únicamente las constantes compartidas:

```js
ROLES.ADMIN;
ROLES.ENTREPRENEUR;
ROLES.CUSTOMER;
```

El cliente tiene cuenta (cambio aprobado). Solo CUSTOMER autenticado puede confirmar pedidos. Revisar docs/PRUEBAS_CUENTAS.md para configuración y limitaciones actuales.

## Estados de pedido

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

No inventes estados adicionales.

## Reglas de negocio

1. Cada emprendedor solo administra su propio negocio.
2. El plan vigente limita la cantidad de productos activos.
3. Desactivar un producto conserva historial.
4. Los pedidos solo cambian mediante transiciones válidas.
5. Cada cambio de estado genera historial.
6. La comisión se genera únicamente al llegar a `DELIVERED`.
7. `CANCELLED` no genera comisión.
8. Formularios deben validar y la lógica/datos debe reforzar reglas críticas.
9. Nunca exponer secretos o credenciales.

## Formato API

Éxito:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje comprensible"
  }
}
```

Las vistas que consumen datos deben contemplar `loading`, `success`, `empty` y `error` cuando aplique.

## Responsabilidades

- Integrante 1: autenticación, roles y usuarios.
- Integrante 2: negocio, categorías, productos e imágenes.
- Integrante 3: catálogo público, carrito y cliente.
- Integrante 4: pedidos, estados, historial y comisión al completar.
- Integrante 5: dashboards, reportes, planes y estados de cuenta.

No reescribas módulos de otro integrante. Si necesitas algo de otro dominio, consume su contrato/service o explica la dependencia antes de proponer un cambio compartido.

## Código

- Variables y funciones en inglés.
- Texto visible al usuario en español.
- Componentes React en PascalCase.
- Variables/funciones en camelCase.
- Preferir código simple, modular y defendible.
- Evitar duplicación y archivos gigantes.
- No hacer reescrituras masivas cuando un cambio puntual resuelve el problema.

## Forma de trabajar del LLM

Antes de modificar código:

1. Identifica los archivos que necesitas tocar.
2. Explica brevemente por qué.
3. Confirma que el cambio respeta arquitectura y responsabilidad del módulo.

Después:

1. Resume qué cambió.
2. Explica cómo probarlo.
3. Indica riesgos, dependencias o pendientes.
4. No afirmes que algo funciona si no fue ejecutado/verificado.

## Git

No trabajar directamente en `main`.

Ramas:

```text
feature/<modulo>-<descripcion>
fix/<modulo>-<descripcion>
docs/<descripcion>
```

Commits:

```text
feat(auth): add login validation
fix(orders): block invalid transition
docs(api): document response format
```

## Meta académica

Todo integrante debe comprender y poder defender el código que integra. Prioriza claridad y comprensión por encima de abstracciones innecesarias.

Si existe un conflicto con `AGENTS.md`, `README.md` o los contratos del repositorio, no inventes una solución: señala el conflicto y pide decisión del equipo.
