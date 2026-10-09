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
git switch develop
```

Actualiza:

```bash
git pull origin develop
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
AdminLTE
Bootstrap
tsx
```

`npm ci` instala todo lo definido por el proyecto.

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
npm ci
npm test
npm run check
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
docs/API_CONVENTIONS.md
docs/DATA_CONTRACTS.md
docs/RESPONSIBILITIES.md
docs/GIT_WORKFLOW.md
docs/CI_CD.md
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
