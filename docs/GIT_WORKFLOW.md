# Flujo Git — EmprendeLink

Esta es la forma oficial de trabajar con Git y GitHub en el proyecto.

---

# Ramas permanentes

```text
main
develop
```

`main`:

```text
versiones estables
entregas
producción futura
```

`develop`:

```text
integración del trabajo del equipo
```

---

# No trabajar directamente en main

Nunca:

```bash
git switch main
# editar código
git commit
git push
```

El trabajo normal nace desde:

```text
develop
```

---

# Antes de comenzar una tarea

```bash
git switch develop
git pull origin develop
```

Crear una rama:

```bash
git switch -c feature/nombre
```

También:

```text
fix/...
docs/...
chore/...
test/...
refactor/...
```

---

# Ejemplos

```text
feature/products-create
feature/orders-history
fix/customer-checkout
docs/firebase-setup
chore/ci-cd
```

---

# Durante el trabajo

Consultar:

```bash
git status
```

Ver cambios:

```bash
git diff
```

Preparar:

```bash
git add .
```

Ver exactamente qué entrará al commit:

```bash
git diff --staged
```

---

# Commits

Formato recomendado:

```text
tipo(modulo): descripción
```

Ejemplos:

```text
feat(products): agregar edición de productos
fix(orders): impedir transición inválida
docs(firebase): agregar guía de configuración
test(auth): ampliar validaciones de acceso
ci: agregar pruebas al pipeline
```

---

# Antes del Push

Ejecutar:

```bash
npm test
npm run check
```

Los dos deben pasar.

Después:

```bash
git status
```

---

# Push

Primera vez:

```bash
git push -u origin nombre-de-rama
```

Siguientes veces:

```bash
git push
```

---

# Pull Request

El flujo normal:

```text
rama temporal
      ↓
Pull Request
      ↓
develop
```

No crear PR normal de feature directamente hacia:

```text
main
```

---

# CI

Cuando un PR apunta hacia:

```text
develop
main
```

GitHub Actions ejecuta automáticamente:

```text
npm ci
npm test
npm run check
```

El check requerido se identifica como:

```text
validate
```

No hacer merge con CI rojo.

Importante:

El identificador del job en:

```text
.github/workflows/ci.yml
```

es parte de la configuración de protección de ramas.

No renombrarlo sin revisar también las reglas de GitHub.

---

# Merge

Cuando:

```text
CI verde
revisión completa
código probado
```

se puede hacer merge.

Después:

```bash
git switch develop
git pull origin develop
```

---

# Eliminar ramas terminadas

Después del merge:

```bash
git branch -d nombre-rama
```

Remota:

```bash
git push origin --delete nombre-rama
```

Actualizar referencias:

```bash
git fetch --prune
```

---

# Ver ramas

Locales:

```bash
git branch
```

Locales + remotas:

```bash
git branch -a
```

Con detalles:

```bash
git branch -vv
```

---

# Ahead y Behind

Ejemplo:

```text
develop
56 ahead
0 behind
main
```

`ahead`:

```text
commits que develop tiene y main todavía no
```

`behind`:

```text
commits que main tiene y develop todavía no
```

Antes de una entrega importante conviene resolver divergencias.

---

# Conflictos

Si Git indica:

```text
CONFLICT
```

no borres archivos al azar.

Primero:

```bash
git status
```

Identifica los archivos.

Si no entiendes qué versión conservar, consulta al responsable del módulo.

Después de resolver:

```bash
git add archivo
git commit
```

---

# Producción

Cuando exista una versión estable:

```text
develop
   ↓
Pull Request
   ↓
CI
   ↓
main
```

`main` será utilizada posteriormente como rama de producción para Vercel.

No promover a main trabajo incompleto.

---

# Regla principal

```text
feature/fix/docs/chore
        ↓
develop
        ↓
main
```

Todo cambio importante debe pasar por Pull Request y CI.
