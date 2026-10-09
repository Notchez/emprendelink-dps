# Contexto para cualquier LLM — EmprendeLink DPS941

Copia este documento al inicio de una conversación con ChatGPT, Claude, Copilot u otro asistente si el asistente no puede leer directamente el repositorio.

Si puede leer el repositorio, indícale primero:

```text
Lee AGENTS.md antes de modificar código.
```

---

# Proyecto

Trabajo en EmprendeLink, proyecto de DPS941.

Es una plataforma para microemprendedores con:

```text
autenticación
roles
negocios
categorías
productos
catálogo
carrito
checkout
pedidos
historial
planes
comisiones
reportes
administración
```

---

# Stack

```text
Node.js 24.x
Next.js 16.3.3
React 19.2.7
JavaScript
Next.js App Router
Firebase JS SDK
Firebase Admin
Firestore
Context API
CSS Modules
AdminLTE React
Bootstrap
Bootstrap Icons
npm
GitHub Actions
Vercel planificado para CD
```

No cambiar versiones ni instalar dependencias sin aprobación.

No migrar a TypeScript.

No agregar Redux o Tailwind.

---

# Arquitectura

```text
UI
↓
Context / hooks / lógica
↓
Services / Route Handlers
↓
Firebase
```

No acceder directamente a Firestore desde componentes visuales si ya existe un service correspondiente.

---

# Firebase por desarrollador

Cada integrante utiliza su propio Firebase.

No asumir una base de datos compartida.

Cada integrante tiene su propio:

```text
.env.local
Firebase Auth
Firestore
Service Account
usuarios
datos
```

El repositorio comparte:

```text
código
firestore.rules
estructura
documentación
```

Nunca pedir credenciales privadas al usuario.

---

# Variables

El proyecto utiliza:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_JSON
```

Los valores reales viven únicamente en:

```text
.env.local
```

---

# Roles

Usar solamente:

```js
ROLES.ADMIN;
ROLES.ENTREPRENEUR;
ROLES.CUSTOMER;
```

ADMIN no se registra públicamente.

CUSTOMER debe autenticarse para confirmar pedidos.

---

# Pedidos

Estados:

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

Los pedidos, historial y comisiones son persistidos en Firestore.

Las operaciones server-side utilizan Firebase Admin.

El servidor debe:

```text
validar token
determinar identidad
validar rol
validar propiedad
consultar precios reales
validar transiciones
```

No confiar en:

```text
customerId enviado por navegador
changedBy enviado por navegador
precio enviado por navegador
```

---

# Comisión

La comisión se crea al llegar a:

```text
DELIVERED
```

No crear comisión para:

```text
CANCELLED
```

La tasa histórica del pedido debe conservarse.

---

# Cliente

La experiencia Cliente es independiente de AdminLTE.

Navegación principal:

```text
Negocios
Pedidos
Mi perfil
```

Carrito es contextual.

Rutas importantes:

```text
/
/catalogo/[slug]
/carrito
/checkout
/checkout/confirmacion
/cliente/pedidos
/cliente/pedidos/[id]
/cliente/perfil
```

---

# Admin y Emprendedor

Los paneles internos utilizan AdminLTE/Bootstrap.

No reemplazar esa base visual sin aprobación.

---

# API

Formato éxito:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Formato error:

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

---

# Tests

Antes de un PR:

```bash
npm test
npm run check
```

Actualmente `npm test` contiene 12 pruebas de acceso, identidad, validaciones y permisos.

Los tests no deben escribir datos en Firebase real.

---

# CI

GitHub Actions ejecuta automáticamente:

```text
npm ci
npm test
npm run check
```

en PR hacia:

```text
develop
main
```

No sugerir saltarse los checks.

---

# Git

Flujo:

```text
develop
↓
feature / fix / docs / chore
↓
Pull Request
↓
CI
↓
develop
```

No trabajar directamente en main.

---

# Responsabilidades

- Integrante 1: autenticación, roles, usuarios.
- Integrante 2: negocio, categorías, productos.
- Integrante 3: catálogo, carrito, cliente.
- Integrante 4: pedidos, estados, historial.
- Integrante 5: dashboard, planes, reportes, comisiones.

Evitar modificar módulos ajenos sin necesidad.

---

# Al modificar código

Antes:

```text
identifica archivos
revisa contratos
explica brevemente el cambio
```

Después:

```text
resume cambios
explica cómo probar
indica riesgos
```

No afirmar que algo funciona si no se ejecutó.

---

# Documentos de referencia

```text
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/API_CONVENTIONS.md
docs/DATA_CONTRACTS.md
docs/FIREBASE_SETUP.md
docs/GIT_WORKFLOW.md
docs/RESPONSIBILITIES.md
docs/PRUEBAS_CUENTAS.md
```

Si estos documentos contradicen una propuesta, no inventes una nueva convención. Señala el conflicto.
