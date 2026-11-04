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
Web: npm ci
↓
Web: npm test
↓
Web: npm run check
↓
Móvil: npm ci
↓
Móvil: npm test
↓
Móvil: npm run export:android
```

---

# npm ci

Instala exactamente las dependencias definidas en los dos lockfiles:

```text
package-lock.json
mobile/package-lock.json
```

Es la instalación utilizada por CI porque debe ser reproducible.

---

# npm test

Ejecuta las pruebas automatizadas.

Actualmente:

```text
Web: 12 tests
Móvil: 18 tests
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

La aplicación móvil se valida con `npm run export:android`. Expo genera un bundle Android en el
runner para detectar imports rotos y errores de Metro sin publicar una aplicación ni requerir un
emulador.

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

Los tests actuales de ninguna plataforma necesitan el Firebase real.

No colocar Service Accounts personales dentro de GitHub Actions solo para ejecutar:

```text
npm test
```

Los tests utilizan persistencia controlada en memoria.

El export Android actual tampoco necesita variables `EXPO_PUBLIC_*` porque Firebase móvil aún no
está implementado. Cuando se integre, el CI deberá recibir únicamente la configuración pública
necesaria para compilar; Firebase Admin seguirá siendo exclusivo del servidor.

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
