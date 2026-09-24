# AGENTS.md — Contexto obligatorio para asistentes LLM

Este archivo define las reglas que debe seguir cualquier asistente de IA que ayude a desarrollar
EmprendeLink.

## 1. Proyecto

**EmprendeLink** es una plataforma web/móvil para microemprendedores.

Etapa actual: **Etapa 2 — Desarrollo Base Web de DPS941**.

Objetivo de la etapa:

- React + Next.js funcional.
- UI / lógica / datos separadas.
- API REST.
- autenticación;
- roles Administrador y Emprendedor;
- módulos principales;
- dashboard;
- actualización dinámica;
- validaciones;
- responsive;
- GitHub colaborativo;
- Vercel.

## 2. Stack congelado

- Node.js 24.21.0 LTS.
- Next.js 16.3.3 Active LTS.
- React 19.2.7.
- Firebase JS SDK 12.18.0.
- JavaScript, NO TypeScript.
- Next.js App Router.
- CSS global + CSS Modules.
- Context API + custom hooks.
- AdminLTE React 0.6.1 para los paneles internos.
- Bootstrap 5.3.8 + Bootstrap Icons 1.13.1 como base visual de AdminLTE.
- npm.
- VS Code.
- Vercel.

### Prohibido sin aprobación del equipo

No:

- migrar a TypeScript;
- agregar Redux;
- agregar Tailwind;
- cambiar o retirar las versiones aprobadas de AdminLTE/Bootstrap;
- cambiar App Router por Pages Router;
- actualizar versiones;
- instalar nuevas librerías;
- sustituir Firebase;
- reorganizar toda la estructura.

Si una dependencia parece necesaria, explicarla antes de proponer `npm install`.

### Dependencias visuales aprobadas

El Tech Lead aprobó AdminLTE 4 mediante su integración oficial para React/Next.js.
Su alcance es el panel administrativo, el panel del emprendedor y la gestión de pedidos.
El catálogo público, carrito, checkout y autenticación conservan su diseño independiente.

## 3. Arquitectura obligatoria

```text
UI
↓
context / hooks / lógica
↓
services / Route Handlers
↓
datos / Firebase
```

No colocar llamadas directas a Firestore dentro de componentes visuales.

No colocar lógica de negocio compleja dentro de JSX.

Preferir:

- componentes pequeños;
- hooks para comportamiento reutilizable;
- services para datos;
- funciones puras para reglas;
- constantes compartidas.

## 4. Roles

Usar únicamente:

```js
ROLES.ADMIN;
ROLES.ENTREPRENEUR;
ROLES.CUSTOMER;
```

Importar desde:

```text
@/lib/constants/roles
```

Cambio de alcance aprobado por el Tech Lead: el cliente tiene cuenta. El catálogo se puede consultar sin sesión, pero confirmar pedidos exige CUSTOMER autenticado. Nombre, teléfono, correo y dirección son obligatorios; deliveryInstructions es opcional. ADMIN se asigna desde Firebase Console, nunca desde el registro público.

## 5. Estados de pedido

Usar:

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

Importar desde:

```text
@/lib/constants/orderStatus
```

No inventar estados nuevos.

## 6. Reglas de negocio

- Cada emprendedor solo administra su propio negocio.
- Un plan limita la cantidad de productos activos.
- Desactivar producto no borra historial.
- Pedidos solo cambian mediante transiciones válidas.
- Todo cambio de estado genera historial.
- Comisión se genera únicamente al llegar a DELIVERED.
- CANCELLED no genera comisión.
- No confiar solo en ocultar botones para seguridad.
- Formularios deben validar.
- No exponer secretos.

## 7. API

Respuesta de éxito:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Respuesta de error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje"
  }
}
```

Usar códigos HTTP coherentes.

Cuando una UI consume API debe contemplar:

- loading;
- success;
- empty;
- error.

## 8. Responsabilidad por módulo

- Integrante 1: auth, roles, usuarios.
- Integrante 2: negocio, categorías, productos, imágenes.
- Integrante 3: catálogo público, carrito, cliente.
- Integrante 4: pedidos, estados, historial, comisión al completar.
- Integrante 5: dashboards, reportes, planes, estados de cuenta.

### Regla para el LLM

Si la solicitud pertenece a otro módulo:

1. señalar la dependencia;
2. preferir consumir un contrato/service existente;
3. evitar reescribir el módulo ajeno;
4. proponer el cambio compartido antes de aplicarlo.

## 9. Estilo de código

- JavaScript moderno.
- Nombres de variables y funciones en inglés.
- Texto visible para usuario en español.
- Componentes React en PascalCase.
- funciones/variables en camelCase.
- constantes compartidas en UPPER_SNAKE_CASE cuando corresponda.
- evitar archivos gigantes;
- evitar duplicación;
- comentarios solo cuando expliquen una decisión no obvia.
- no dejar código muerto.

## 10. Cómo debe responder el asistente al programar

Antes de una modificación importante:

1. indicar qué archivos va a crear/modificar;
2. explicar brevemente por qué;
3. respetar contratos existentes.

Después:

1. resumir qué cambió;
2. indicar cómo probarlo;
3. mencionar cualquier dependencia o riesgo;
4. no afirmar que algo funciona si no fue probado.

No hacer reescrituras masivas cuando un cambio pequeño resuelve el problema.

## 11. Git

No sugerir trabajo directo en `main`.

Usar ramas:

- `feature/...`
- `fix/...`
- `docs/...`

Commits:

```text
feat(auth): add login validation
fix(orders): block invalid transition
docs(api): document response format
```

## 12. Seguridad

Nunca:

- escribir credenciales reales;
- subir `.env.local`;
- hardcodear contraseñas;
- poner claves privadas en código;
- desactivar reglas de seguridad como solución permanente.

## 13. Defensa académica

El código debe ser comprensible por el estudiante.

Priorizar la solución más clara y defendible frente a abstracciones innecesarias.

Si existen dos soluciones válidas, preferir la más simple que cumpla correctamente los requisitos.

## 14. Fuente de verdad

Antes de crear nuevos conceptos revisar:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_CONTRACTS.md`
- `docs/API_CONVENTIONS.md`
- `docs/RESPONSIBILITIES.md`

Si hay conflicto, detenerse y pedir decisión del equipo en vez de inventar una convención nueva.
