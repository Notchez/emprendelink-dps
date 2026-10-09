# CI/CD — EmprendeLink

Estado actual:

```text
CI ✅ configurado
CD ⏳ pendiente de configuración final con Vercel
```

No asumir que producción automática ya está habilitada.

---

# ¿Qué es CI?

CI significa:

```text
Continuous Integration
Integración Continua
```

Su objetivo es comprobar automáticamente que un cambio no rompa el proyecto.

---

# CI actual

Archivo:

```text
.github/workflows/ci.yml
```

Se ejecuta cuando existe:

```text
Pull Request → develop
Pull Request → main
Push → develop
Push → main
```

---

# Pipeline

GitHub Actions ejecuta:

```text
Checkout
↓
Node.js
↓
npm ci
↓
npm test
↓
npm run check
```

---

# npm ci

Instala exactamente las dependencias definidas en:

```text
package-lock.json
```

Es la instalación utilizada por CI porque debe ser reproducible.

---

# npm test

Ejecuta las pruebas automatizadas.

Actualmente:

```text
12 tests
```

Los tests no escriben en Firebase real.

---

# npm run check

Ejecuta:

```text
npm run lint
npm run build
```

Por lo tanto valida:

```text
calidad estática
+
compilación de producción
```

---

# Check requerido

El job del workflow se llama:

```text
validate
```

GitHub puede requerir ese check antes de permitir merge.

No renombrar el job sin actualizar la protección de ramas.

---

# Flujo esperado

```text
Developer
   ↓
rama
   ↓
Pull Request
   ↓
GitHub Actions
   ↓
validate
   ↓
verde
   ↓
merge
```

Si queda rojo:

```text
NO hacer merge
```

---

# ¿Qué es CD?

CD normalmente significa:

```text
Continuous Delivery
o
Continuous Deployment
```

En nuestro proyecto el despliegue se realizará con:

```text
Vercel
```

La configuración final todavía está pendiente.

---

# Diseño previsto

Cuando se configure Vercel:

```text
ramas / PR
→ Preview Deployment

main
→ Production Deployment
```

`develop` no debe convertirse accidentalmente en producción.

---

# Firebase en CI

Los tests actuales no necesitan el Firebase real.

No colocar Service Accounts personales dentro de GitHub Actions solo para ejecutar:

```text
npm test
```

Los tests utilizan persistencia controlada en memoria.

---

# Secretos

Nunca guardar en:

```text
ci.yml
repositorio
README
commits
```

valores como:

```text
FIREBASE_SERVICE_ACCOUNT_JSON
private_key
contraseñas
tokens
```

Cuando configuremos Vercel, los secretos de producción se agregarán mediante variables de entorno de la plataforma.

---

# Estado pendiente

Antes de considerar terminado el CD falta:

```text
conectar Vercel
configurar Production Branch
configurar variables
probar Preview
probar Production
documentar URL final
```

Este documento debe actualizarse cuando esa configuración quede terminada.
