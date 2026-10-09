# Contribución a EmprendeLink

Guía básica para trabajar en el repositorio sin romper el trabajo del equipo.

---

# Antes de comenzar

Actualiza develop:

```bash
git switch develop
git pull origin develop
```

Crea tu rama:

```bash
git switch -c feature/<descripcion>
```

Ejemplo:

```bash
git switch -c feature/products-edit
```

---

# Tipos de rama

```text
feature/
fix/
docs/
chore/
test/
refactor/
```

---

# Durante el trabajo

No mezclar varias funcionalidades grandes en una misma rama si no están relacionadas.

No modificar módulos ajenos sin entender la dependencia.

No instalar dependencias sin avisar al equipo.

No subir secretos.

---

# Firebase

Cada integrante utiliza su propio Firebase.

Configuración:

```text
docs/FIREBASE_SETUP.md
```

Nunca subir:

```text
.env.local
Service Account
private_key
contraseñas
tokens
```

---

# Antes del Pull Request

Ejecutar:

```bash
npm test
npm run check
```

Luego:

```bash
git status
git diff
```

---

# Commit

Formato recomendado:

```text
tipo(modulo): descripción
```

Ejemplos:

```text
feat(products): agregar edición
fix(auth): corregir redirección
docs(firebase): actualizar instalación
test(orders): agregar validación
```

Evitar:

```text
cambios
final
final2
ya quedó
update
```

---

# Push

Primera vez:

```bash
git push -u origin nombre-rama
```

Después:

```bash
git push
```

---

# Pull Request

Normalmente:

```text
tu rama
↓
develop
```

El PR debe explicar:

1. qué cambia;
2. qué módulo afecta;
3. cómo probarlo;
4. riesgos o pendientes;
5. capturas si modifica UI.

---

# CI

GitHub ejecutará automáticamente:

```text
npm ci
npm test
npm run check
```

No hacer merge si:

```text
validate ❌
```

---

# No hacer

- push directo a `main`;
- force push en ramas compartidas;
- subir `.env.local`;
- subir credenciales Firebase;
- modificar contratos sin coordinación;
- borrar código ajeno para resolver conflictos;
- ignorar tests fallidos;
- desactivar seguridad para que algo "funcione";
- integrar código generado por IA que no puedas explicar.

---

# Después del merge

Vuelve a:

```bash
git switch develop
git pull origin develop
```

Si la rama ya terminó:

```bash
git branch -d nombre-rama
```

---

# Ayuda de LLM

Si utilizas un asistente con acceso al repo, dile:

```text
Lee AGENTS.md antes de modificar código.
```

Si no puede leer el repo:

```text
copia docs/LLM_CONTEXT.md
```

Nunca le compartas tus credenciales.
