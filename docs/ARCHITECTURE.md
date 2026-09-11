# Arquitectura de EmprendeLink

## Capas

### 1. UI / Presentación

Ubicación principal:

- `src/app`
- `src/components`

Responsabilidad:

- mostrar información;
- formularios;
- navegación;
- eventos de usuario;
- estados visuales.

No debe:

- acceder directamente a Firestore;
- contener reglas de negocio complejas.

### 2. Estado y lógica

Ubicación:

- `src/context`
- `src/hooks`
- `src/utils` para funciones puras.

Responsabilidad:

- sesión;
- roles;
- coordinación del estado;
- validaciones reutilizables;
- reglas de negocio.

### 3. Servicios / datos

Ubicación:

- `src/services`
- `src/app/api`
- `src/lib/firebase`

Responsabilidad:

- llamadas HTTP;
- acceso a Firebase;
- normalización de respuestas;
- persistencia.

## Flujo esperado

```text
Componente
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

## Principio de autonomía

Los módulos se comunican mediante contratos compartidos y services. Un módulo no debe importar
componentes internos de otro módulo para acceder a sus datos.
