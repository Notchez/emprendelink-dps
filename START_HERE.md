# START HERE — EmprendeLink

Si acabas de descargar/clonar el proyecto y no sabes qué hacer, comienza aquí.

---

# 1. Instala las herramientas

Necesitas:

```text
Git
Node.js 24.x
VS Code
```

Comprueba:

```bash
git --version
node -v
npm -v
```

---

# 2. Clona el repositorio

```bash
git clone https://github.com/Notchez/emprendelink-dps.git
```

Entra:

```bash
cd emprendelink-dps
```

Cambia a:

```bash
git switch main
```

Actualiza:

```bash
git pull --ff-only origin main
```

---

# 3. Instala las dependencias

```bash
npm ci
```

No necesitas instalar manualmente:

```text
Next.js
React
Firebase
Bootstrap
tsx
```

`npm ci` instala todo lo definido por el proyecto.

La aplicación móvil usa un proyecto npm independiente:

```bash
cd mobile
npm ci
cd ..
```

Firebase Authentication, Google Sign-In y Firestore ya están integrados en `mobile/`. Configura las variables públicas en `mobile/.env`; no copies credenciales administrativas a Expo.

---

# 4. Crea tu propio Firebase

NO uses el Firebase de otro integrante.

Lee:

```text
docs/FIREBASE_SETUP.md
```

Ese documento explica desde cero:

```text
crear Firebase
activar Authentication
crear Firestore
publicar reglas
crear Service Account
crear .env.local
crear ADMIN
crear planes
crear cuentas de prueba
```

---

# 5. Crea `.env.local`

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Completa ese archivo utilizando TU Firebase.

Nunca subas:

```text
.env.local
```

---

# 6. Comprueba el proyecto

Primero:

```bash
npm test
```

Después:

```bash
npm run check
```

Finalmente:

```bash
npm run dev
```

Abre:

```text
http://localhost:3000
```

Comprueba también la aplicación móvil:

```bash
cd mobile
npm test
npm run export:android
```

El bundle se genera en `mobile/dist/`, que está ignorado por Git.

---

# 7. Si vas a programar

Nunca programes directamente en:

```text
main
```

Tampoco debes desarrollar normalmente directamente en:

```text
develop
```

Primero:

```bash
git switch develop
git pull origin develop
```

Luego crea una rama.

Ejemplos:

```bash
git switch -c feature/products-edit
```

```bash
git switch -c fix/orders-status
```

```bash
git switch -c docs/update-readme
```

---

# 8. Antes de subir cambios

Ejecuta:

```bash
npm test
npm run check
```

Después:

```bash
git status
git diff
```

Luego crea tu commit y haz push.

---

# 9. Pull Request

El flujo normal es:

```text
tu rama
   ↓
Pull Request
   ↓
develop
```

GitHub ejecutará automáticamente el CI.

El CI realiza:

```text
Web: npm ci, npm test y npm run check
Móvil: npm ci, npm test y npm run export:android
```

No hagas merge si los checks están rojos.

---

# 10. Si utilizas ChatGPT, Claude, Copilot u otro LLM

Si el LLM puede leer el repositorio, dile:

```text
Antes de modificar código, lee AGENTS.md, README.md,
docs/LLM_CONTEXT.md y los documentos relacionados
con el módulo que vas a trabajar.
Respeta las reglas del repositorio.
```

Si el LLM NO puede leer archivos:

```text
copia y pega docs/LLM_CONTEXT.md
```

antes de pedirle código.

Nunca envíes a un LLM:

```text
.env.local
Service Account
contraseñas
tokens
private keys
```

---

# 11. Documentos importantes

```text
README.md
AGENTS.md
CONTRIBUTING.md

docs/FIREBASE_SETUP.md
docs/LLM_CONTEXT.md
docs/ARCHITECTURE.md
docs/INDEX.md
docs/ENTREGA_FINAL.md
mobile/README.md
docs/archivo/AUDIT_FORO2.md
docs/API_CONVENTIONS.md
docs/DATA_CONTRACTS.md
docs/RESPONSIBILITIES.md
docs/GIT_WORKFLOW.md
docs/CI_CD.md
docs/LICENSING.md
docs/PRUEBAS_CUENTAS.md
```

---

# Regla simple

Si no sabes qué hacer:

```text
1. No improvises.
2. No cambies dependencias.
3. No toques main.
4. No compartas credenciales.
5. Lee la documentación.
6. Pregunta antes de romper contratos compartidos.
```

## Ejecución integrada web y Android (entrega final)

1. Configura ".env.local" (raíz) y "mobile/.env" siguiendo `docs/FIREBASE_SETUP.md` y `mobile/.env.example`.
2. Desde la raíz: `npm run dev -- --hostname 0.0.0.0` (API en puerto 3000).
3. Desde `mobile/`: `npx expo start --dev-client --clear --lan`.
4. En `mobile/.env`, `EXPO_PUBLIC_API_BASE_URL` debe apuntar a la IP LAN vigente de la PC, por ejemplo `http://192.168.1.X:3000` (sustituye X por el número actual).
5. Abre `http://<IP-LAN>:3000/api/health` desde Chrome en el teléfono para comprobar conectividad.

Para Google Sign-In y cambios nativos se necesita un development build Android (no Expo Go). No subas `.env`, `.env.local`, `google-services.json` ni Service Accounts.
