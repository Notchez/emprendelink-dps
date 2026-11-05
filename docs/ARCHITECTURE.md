# Arquitectura de EmprendeLink

EmprendeLink contiene dos aplicaciones que comparten contratos de datos y reglas de negocio:

```text
Web: Next.js + React + Firebase
Móvil: React Native + Expo + Firebase JS SDK
```

## Aplicación web

### 1. UI / presentación

Ubicación principal:

- `src/app`;
- `src/components`.

Muestra información, formularios, navegación y estados visuales. No debe acceder directamente a
Firestore ni contener reglas de negocio complejas.

### 2. Estado y lógica

Ubicación:

- `src/context`;
- `src/hooks`;
- `src/utils` para funciones puras.

Coordina sesión, roles, estado, validaciones reutilizables y reglas de negocio.

### 3. Servicios y datos

Ubicación:

- `src/services`;
- `src/app/api`;
- `src/lib/firebase`.

Los services cliente consumen Firebase Web SDK o los Route Handlers. Las operaciones privilegiadas
de pedidos, historial y comisiones pasan por Route Handlers y Firebase Admin.

```text
Componente web
  ↓
Hook / Context / función de dominio
  ↓
Service
  ↓
Route Handler / Firebase
  ↓
Respuesta estándar
  ↓
UI
```

## Aplicación móvil

Ubicación principal:

- `mobile/src/screens` y `mobile/src/components`: presentación;
- `mobile/src/context`, `mobile/src/hooks` y `mobile/src/utils`: estado y lógica;
- `mobile/src/services`: frontera de acceso a Firebase cliente y API web;
- `mobile/src/lib/firebase/client.js`: inicialización única del SDK y persistencia de Auth.

```text
Pantalla móvil
  ↓
Context / hook / validación
  ↓
Service
  ↓
Firebase Authentication / Firestore permitido / API web protegida
```

Las pantallas móviles no importan Firebase directamente. Authentication y lecturas públicas usan el
SDK cliente detrás de services; pedidos e historial pasan por la API web con un Firebase ID token.

## Integración web y móvil

Durante pruebas integradas, ambas aplicaciones deben apuntar al mismo proyecto Firebase para
compartir usuarios y datos. Firebase Authentication emitirá la identidad y Firestore conservará los
perfiles y recursos. El móvil consultará directamente solo las colecciones permitidas por reglas;
pedidos y operaciones privilegiadas seguirán pasando por la API de Next.js, que valida sesión, rol,
propiedad y datos antes de usar Firebase Admin.

En desarrollo individual cada integrante puede usar un proyecto Firebase propio. Las variables y
credenciales nunca se comparten ni se versionan.

## Principio de autonomía

Los módulos y plataformas se comunican mediante contratos compartidos y services. Un módulo no debe
importar componentes internos de otro módulo para acceder a sus datos. Los contratos oficiales se
mantienen en `docs/DATA_CONTRACTS.md` y `docs/API_CONVENTIONS.md`.
