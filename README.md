# EmprendeLink — DPS941

Proyecto de cátedra de **Diseño y Programación de Software Multiplataforma (DPS941)**.

Este repositorio contiene la base común para la **Etapa 2 — Desarrollo Base Web**.  
La meta es que los cinco integrantes trabajen en paralelo con la misma arquitectura, reglas de
negocio, convenciones y parámetros técnicos.

> **Antes de programar:** todos deben leer este README, `AGENTS.md` y `CONTRIBUTING.md`.

---

## Integrantes del equipo

- Marvin Francisco Pérez Calderón — PC253641
- Rafael Mena Mejia — MM253045
- Tito Mauricio Nochez Villagran — NV101005
- Luis Miguel Granados Artiga — GA130557
- Jorge Alfonzo Mendoza Padilla — MP241100

## 1. Objetivo de EmprendeLink

EmprendeLink es una plataforma orientada a microemprendedores y pequeños negocios. Permitirá
publicar un catálogo digital, recibir pedidos de forma estructurada, gestionar productos,
clientes y pedidos, aplicar reglas de planes/comisiones y consultar reportes.

### Roles

- **Administrador**: gestiona usuarios/emprendedores, planes, estados de cuenta y reportes globales.
- **Emprendedor**: administra su negocio, productos, pedidos, clientes y reportes.
- **Cliente**: visitante público; consulta catálogo y realiza pedidos sin cuenta en el alcance inicial.

---

## 2. Stack congelado para Etapa 2

| Herramienta          | Versión / decisión             |
| -------------------- | ------------------------------ |
| Node.js              | **24.21.0 LTS**                |
| Next.js              | **16.3.3 Active LTS**          |
| React                | **19.2.7**                     |
| Firebase JS SDK      | **12.18.0**                    |
| Lenguaje             | **JavaScript**                 |
| Router               | **App Router**                 |
| Estilos              | **CSS global + CSS Modules**   |
| Estado compartido    | **Context API + custom hooks** |
| Editor               | **VS Code**                    |
| Despliegue           | **Vercel**                     |
| Control de versiones | **Git + GitHub**               |

**Regla:** no actualizar versiones, cambiar de lenguaje, agregar Tailwind/Bootstrap/Redux ni
introducir una dependencia nueva sin acuerdo del equipo.

React no maneja una línea LTS propia como Node o Next.js; por estabilidad del proyecto se deja
fijada la versión indicada y no se actualiza durante la entrega sin necesidad real.

---

## 3. Instalación

### Requisitos

1. Git.
2. Node.js 24.21.0 LTS.
3. VS Code.
4. npm incluido con Node.
5. Las extensiones recomendadas por `.vscode/extensions.json`.

### Primera instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd emprendelink-dps
npm install
cp .env.example .env.local
npm run dev
```

En Windows PowerShell, para crear `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Abrir:

```text
http://localhost:3000
```

Comprobar API base:

```text
http://localhost:3000/api/health
```

Antes de subir cambios:

```bash
npm run lint
npm run build
```

---

## 4. Arquitectura obligatoria

Cada funcionalidad debe respetar:

```text
UI / componentes
      ↓
hooks / context / lógica de aplicación
      ↓
services / API
      ↓
Firebase / Firestore u origen de datos acordado
```

### Regla principal

**Un componente visual NO debe contener directamente reglas complejas de negocio ni acceso a
Firestore.**

La explicación completa está en:

- `docs/ARCHITECTURE.md`
- `docs/API_CONVENTIONS.md`

---

## 5. Estructura del proyecto

```text
src/
├── app/                  # rutas, layouts y Route Handlers
├── components/           # componentes visuales
├── context/              # estado global compartido
├── hooks/                # custom hooks
├── services/             # acceso a API / Firebase
├── lib/
│   ├── constants/        # contratos comunes
│   └── firebase/         # configuración Firebase
├── data/mock/            # datos temporales para desarrollo
└── utils/                # utilidades puras
```

No crear carpetas paralelas que dupliquen estas responsabilidades sin discutirlo primero.

---

## 6. División de trabajo

| Integrante | Dominio                                                 |
| ---------- | ------------------------------------------------------- |
| 1          | Autenticación, roles y usuarios                         |
| 2          | Negocio, categorías, productos e imágenes               |
| 3          | Catálogo público, carrito y cliente                     |
| 4          | Pedidos y lógica central                                |
| 5          | Dashboard, reportes, planes y administración financiera |

Ver detalles y fronteras en `docs/RESPONSIBILITIES.md`.

---

## 7. Contratos comunes

### Roles

```js
ROLES.ADMIN;
ROLES.ENTREPRENEUR;
```

El cliente público no utiliza rol autenticado en el alcance inicial.

### Estados del pedido

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

Las constantes oficiales están en:

```text
src/lib/constants/roles.js
src/lib/constants/orderStatus.js
```

No escribir strings alternativos como `"admin"`, `"Administrador"` o `"entregado"` dispersos por
el proyecto. Consumir las constantes comunes.

### Respuesta estándar de API

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

---

## 8. Reglas de negocio que NO deben romperse

1. Un emprendedor solo puede acceder/modificar datos de su propio negocio.
2. El número de productos activos no puede superar el límite del plan vigente.
3. Desactivar un producto conserva su historial.
4. Un pedido solo puede avanzar mediante transiciones válidas.
5. Cada cambio de estado debe conservar historial.
6. La comisión se genera solamente cuando el pedido llega a `DELIVERED`.
7. Un pedido cancelado no genera comisión.
8. Las validaciones deben existir en UI y reforzarse en lógica/datos.
9. Ningún secreto debe subirse a GitHub.
10. Los cambios de contrato o alcance deben discutirse antes de implementarse.

---

## 9. Git y ramas

Ramas permanentes:

```text
main
develop
```

Trabajo normal:

```text
feature/<modulo>-<descripcion>
fix/<modulo>-<descripcion>
docs/<descripcion>
```

Ejemplos:

```text
feature/auth-login
feature/products-create
feature/orders-status-history
fix/catalog-mobile-layout
```

Nunca desarrollar directamente sobre `main`.

Flujo:

```text
develop
   ↓
feature/...
   ↓
Pull Request
   ↓
develop
   ↓
main (entregas estables)
```

Leer `CONTRIBUTING.md` y `docs/GIT_WORKFLOW.md`.

---

## 10. Commits

Formato recomendado:

```text
tipo(modulo): descripción corta
```

Ejemplos:

```text
feat(auth): add login form validation
feat(products): implement product list
fix(orders): prevent invalid status transition
docs(readme): update local setup
refactor(catalog): extract product card component
```

Evitar:

```text
cambios
arreglos
update
ya quedo
final final
```

---

## 11. Uso de asistentes LLM

Cada integrante puede usar el asistente que prefiera. Si el asistente tiene acceso al repositorio, debe leer `AGENTS.md`. Si no puede leer archivos, se le debe copiar completo `docs/LLM_CONTEXT.md` antes de pedirle código.

La guía obliga al asistente a:

- respetar la arquitectura;
- respetar versiones;
- no inventar cambios de alcance;
- no modificar módulos de otros integrantes sin necesidad;
- usar los contratos comunes;
- producir código explicable;
- identificar archivos afectados;
- evitar dependencias innecesarias;
- mantener el código defendible por el estudiante.

**La IA ayuda; el responsable del módulo debe comprender y poder explicar cada cambio integrado.**

---

## 12. Variables de entorno

Crear:

```text
.env.local
```

a partir de:

```text
.env.example
```

Nunca subir `.env.local`.

Las claves públicas de configuración de Firebase se administrarán mediante variables de entorno.
Ninguna clave privada o credencial administrativa debe quedar dentro del repositorio.

---

## 13. Definición de terminado de una tarea

Una funcionalidad no está terminada solo porque “se ve”.

Debe cumplir:

- funciona en el flujo principal;
- valida entradas;
- maneja loading cuando aplica;
- maneja errores;
- maneja estado vacío cuando aplica;
- es responsive;
- respeta roles/permisos;
- respeta arquitectura;
- no incluye secretos;
- `npm run lint` pasa;
- `npm run build` pasa;
- tiene commits claros;
- el autor puede explicar el código.

---

## 14. Documentos del repositorio

- `AGENTS.md` — instrucciones automáticas para agentes que leen el repositorio.
- `docs/LLM_CONTEXT.md` — contexto listo para copiar/pegar en cualquier LLM.
- `CONTRIBUTING.md` — reglas de colaboración.
- `docs/ARCHITECTURE.md` — arquitectura del proyecto.
- `docs/API_CONVENTIONS.md` — estándar REST.
- `docs/GIT_WORKFLOW.md` — flujo Git.
- `docs/RESPONSIBILITIES.md` — división de módulos.
- `docs/DATA_CONTRACTS.md` — estructuras iniciales compartidas.

---

## 15. Regla final

Si un cambio afecta **contratos compartidos, estructura global, dependencias, arquitectura,
autenticación común o reglas de negocio**, no debe integrarse unilateralmente.

Primero se comunica al equipo, luego se modifica.
