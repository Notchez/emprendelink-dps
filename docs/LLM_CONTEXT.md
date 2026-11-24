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
Next.js 16.4.6
React 19.2.7
JavaScript
Next.js App Router
Firebase JS SDK
Firebase Admin
Firestore
Context API
CSS Modules
Bootstrap
Bootstrap Icons
npm
GitHub Actions
Vercel planificado para CD

Aplicación móvil:
React Native 0.86.3
Expo SDK 57
React Navigation 7
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

La aplicación móvil vive en `mobile/` y conserva el mismo flujo:

```text
Pantallas / componentes
↓
Context / hooks / lógica
↓
Services
↓
Firebase Authentication y Firestore cliente / API Next.js protegida
```

Firebase móvil está integrado mediante services y Context. La aplicación incluye pantallas nativas
CUSTOMER, ENTREPRENEUR y ADMIN; sus pedidos e informes usan la API Next.js protegida y Firebase Admin
solo en el servidor. Los tests usan inyección/mocks, pero los services de producción consultan datos reales.

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

La futura configuración pública de Expo utilizará variables `EXPO_PUBLIC_*` locales dentro de
`mobile/`. Nunca colocar `FIREBASE_SERVICE_ACCOUNT_JSON` ni otra credencial privada en una variable
de Expo: todo valor `EXPO_PUBLIC_*` queda incluido en el bundle móvil.

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

La experiencia Cliente es independiente del layout administrativo.

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

Los paneles internos utilizan un layout propio en React y CSS, con utilidades e iconos de Bootstrap.

No modificar la base visual compartida sin aprobación del equipo.

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

Actualmente la web contiene 12 pruebas de acceso, identidad, validaciones y permisos. La aplicación
móvil contiene 18 pruebas unitarias de validación, carrito, pedidos temporales y flujo por rol.

Los tests no deben escribir datos en Firebase real.

Validación móvil:

```bash
cd mobile
npm test
npm run export:android
```

---

# CI

GitHub Actions ejecuta automáticamente:

```text
Web: npm ci, npm test y npm run check
Móvil: npm ci, npm test y npm run export:android
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
docs/archivo/AUDIT_FORO2.md
docs/API_CONVENTIONS.md
docs/DATA_CONTRACTS.md
docs/FIREBASE_SETUP.md
docs/GIT_WORKFLOW.md
docs/CI_CD.md
docs/LICENSING.md
docs/RESPONSIBILITIES.md
docs/PRUEBAS_CUENTAS.md
```

Si estos documentos contradicen una propuesta, no inventes una nueva convención. Señala el conflicto.

# Entrega final y estado real (noviembre 2026)

- Web: Next.js 16.4.6 / React 19; móvil: React Native 0.86.3 / Expo 57.
- Los tres roles tienen interfaz nativa móvil; no se utiliza WebView para los paneles.
- Google Sign-In requiere development build, configuración OAuth/SHA y Firebase Authentication.
- El carrito y las órdenes se aíslan al cambiar UID: consultar `mobile/App.js` y `OrdersContext.js`.
- El cambio de estados y comisiones se aplica en servidor; DELIVERED crea una comisión y CANCELLED no.
- La API está en `src/app/api/`; el móvil usa `EXPO_PUBLIC_API_BASE_URL` y Bearer ID token.
- No hay evidencia documental de CD en producción o publicación en Google Play; no afirmarlas.
- Video: https://drive.google.com/file/d/1QbS6Q21RjCO1KAxpJVTVR_uC7G1SOpJi/view?usp=drive_link. Véase `docs/ENTREGA_FINAL.md`.
