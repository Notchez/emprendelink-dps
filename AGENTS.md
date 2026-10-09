# AGENTS.md — Instrucciones obligatorias para asistentes LLM

Este archivo define cómo debe trabajar cualquier asistente de IA dentro de EmprendeLink.

Antes de modificar código, leer este documento completo.

---

# Proyecto

EmprendeLink es un proyecto académico de DPS941 para microemprendedores.

Tecnologías principales:

```text
JavaScript
Next.js App Router
React
Firebase
Firestore
Firebase Admin
AdminLTE
Bootstrap
CSS Modules
Context API
```

---

# Versiones fijadas

Usar las versiones existentes en:

```text
package.json
package-lock.json
```

No actualizar dependencias sin aprobación.

No migrar a:

```text
TypeScript
Redux
Tailwind
Pages Router
otro backend
otra base de datos
```

sin decisión explícita del equipo.

---

# Arquitectura obligatoria

```text
UI
↓
Context / hooks / lógica
↓
Services / Route Handlers
↓
Firebase
```

No colocar acceso directo complejo a Firestore dentro de componentes visuales.

No colocar reglas críticas de negocio dentro de JSX.

---

# Firebase

Cada desarrollador utiliza su propio proyecto Firebase.

Nunca asumir que todos comparten el mismo Firebase.

Configuración:

```text
docs/FIREBASE_SETUP.md
```

Nunca pedir, mostrar ni escribir:

```text
.env.local
Service Account
private_key
contraseñas
tokens
```

Si falta configuración Firebase, explicar cómo configurarla; no inventar credenciales.

---

# Firebase cliente y servidor

Firebase Web SDK se utiliza para operaciones client-side permitidas.

Firebase Admin se utiliza server-side para operaciones privilegiadas, principalmente:

```text
orders
orderHistory
commissions
```

Las reglas de Firestore no se aplican a Firebase Admin.

Por eso los Route Handlers deben validar:

```text
sesión
rol
propiedad del recurso
datos recibidos
transiciones permitidas
```

Nunca confiar únicamente en ocultar botones del frontend.

---

# Roles

Usar:

```js
ROLES.ADMIN;
ROLES.ENTREPRENEUR;
ROLES.CUSTOMER;
```

Importar desde:

```text
@/lib/constants/roles
```

No utilizar strings alternativos dispersos.

---

# CUSTOMER

El catálogo puede consultarse sin sesión.

Confirmar un pedido requiere CUSTOMER autenticado.

CUSTOMER solo puede consultar sus propios pedidos.

No puede cambiar estados.

---

# ENTREPRENEUR

Solo puede administrar su propio negocio y sus recursos.

No debe obtener acceso a pedidos o información de otro emprendimiento.

---

# ADMIN

ADMIN no puede crearse desde el registro público.

Se asigna manualmente desde Firebase Console por el responsable del proyecto.

---

# Estados de pedido

Usar únicamente:

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

No inventar estados.

---

# Comisiones

La comisión se genera únicamente cuando el pedido llega a:

```text
DELIVERED
```

Un pedido:

```text
CANCELLED
```

no genera comisión.

La tasa correspondiente al pedido debe conservarse históricamente.

---

# Datos

Consultar antes de cambiar estructuras:

```text
docs/DATA_CONTRACTS.md
```

No cambiar nombres de campos compartidos sin coordinación.

---

# API

Los Route Handlers viven en:

```text
src/app/api/
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Errores:

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

Consultar:

```text
docs/API_CONVENTIONS.md
```

---

# Responsabilidades del equipo

Consultar:

```text
docs/RESPONSIBILITIES.md
```

Si una solicitud afecta un módulo ajeno:

1. identificar la dependencia;
2. utilizar contracts/services existentes;
3. evitar reescribir código del otro integrante;
4. avisar si hace falta cambiar un contrato compartido.

---

# UI

Admin y Emprendedor utilizan AdminLTE/Bootstrap.

Cliente utiliza su interfaz propia.

No forzar AdminLTE en la experiencia Cliente.

Mantener responsive.

---

# Código

Usar:

```text
JavaScript
PascalCase para componentes
camelCase para variables y funciones
texto visible en español
nombres técnicos en inglés
```

Evitar:

```text
duplicación
archivos gigantes
código muerto
dependencias innecesarias
abstracciones difíciles de defender
```

---

# Antes de modificar código

El asistente debe:

1. identificar archivos afectados;
2. revisar contratos existentes;
3. revisar si el cambio afecta otro módulo;
4. mantener la solución lo más simple posible.

No hacer reescrituras masivas si un cambio pequeño resuelve el problema.

---

# Después de modificar código

Debe indicar:

```text
qué cambió
cómo probarlo
qué archivos fueron afectados
riesgos o dependencias
```

No afirmar que funciona si no fue probado.

---

# Tests

Antes de Pull Request:

```bash
npm test
npm run check
```

`npm test` no debe utilizar el Firebase real para las pruebas automatizadas actuales.

Los tests de acceso utilizan persistencia mockeada en memoria.

---

# CI

GitHub Actions ejecuta:

```text
npm ci
npm test
npm run check
```

sobre PR hacia:

```text
develop
main
```

No sugerir ignorar o desactivar CI para lograr un merge.

---

# Git

No trabajar directamente en:

```text
main
```

Flujo:

```text
develop
↓
rama temporal
↓
PR
↓
CI
↓
develop
```

Ramas válidas:

```text
feature/...
fix/...
docs/...
chore/...
test/...
refactor/...
```

---

# Seguridad

Nunca:

```text
subir .env.local
subir Service Accounts
hardcodear contraseñas
desactivar reglas como solución permanente
confiar en datos enviados por el navegador
```

---

# Defensa académica

El estudiante debe poder explicar el código.

Priorizar soluciones:

```text
claras
pequeñas
predecibles
defendibles
```

sobre arquitecturas innecesariamente complejas.

---

# Fuente de verdad

Antes de inventar una solución, revisar:

```text
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/DATA_CONTRACTS.md
docs/API_CONVENTIONS.md
docs/RESPONSIBILITIES.md
docs/FIREBASE_SETUP.md
docs/GIT_WORKFLOW.md
```

Si existe contradicción, señalarla y pedir decisión antes de cambiar contratos compartidos.
