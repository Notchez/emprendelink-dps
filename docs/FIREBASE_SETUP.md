# Configuración de Firebase desde cero — EmprendeLink

Esta guía está pensada para un integrante que acaba de clonar el repositorio y nunca ha configurado Firebase.

No necesitas acceso al Firebase de otro integrante.

Cada desarrollador debe crear su propio proyecto Firebase.

---

# 1. Cómo funciona

Todos usamos el mismo código:

```text
EmprendeLink
├── UI
├── lógica
├── servicios
├── reglas
└── estructura de datos
```

Pero cada integrante puede utilizar una base de datos independiente:

```text
Tito
└── Firebase Tito

Marvin
└── Firebase Marvin

Rafael
└── Firebase Rafael

Luis
└── Firebase Luis

Jorge
└── Firebase Jorge
```

Por lo tanto:

- borrar datos en tu Firebase no afecta a los demás;
- tus usuarios son solamente tuyos;
- tus pedidos son solamente tuyos;
- tus credenciales son solamente tuyas;
- nadie necesita compartir una Service Account.

---

# 2. Requisitos

Antes de continuar necesitas:

- Git;
- Node.js 24.x;
- npm;
- VS Code;
- una cuenta de Google;
- el repositorio EmprendeLink clonado.

Comprueba Node:

```bash
node -v
```

Debe mostrar una versión `24.x`.

Comprueba npm:

```bash
npm -v
```

---

# 3. Crear un proyecto Firebase

Abrir:

```text
https://console.firebase.google.com/
```

Seleccionar:

```text
Crear un proyecto
```

Puedes utilizar un nombre como:

```text
emprendelink-tu-nombre
```

Ejemplo:

```text
emprendelink-marvin
```

Google Analytics no es necesario para este proyecto.

Finaliza la creación del proyecto.

---

# 4. Crear la aplicación Web

Dentro del proyecto Firebase:

```text
Configuración del proyecto
→ General
→ Tus apps
→ Agregar app
→ Web
```

El icono Web normalmente aparece como:

```text
</>
```

Nombre sugerido:

```text
EmprendeLink Web
```

No es necesario configurar Firebase Hosting.

Firebase mostrará una configuración parecida a:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

NO copies ese código dentro del proyecto.

Los valores deben ir en `.env.local`.

---

# 5. Crear `.env.local`

Desde la raíz del repositorio.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS / Linux:

```bash
cp .env.example .env.local
```

Luego abre:

```text
.env.local
```

Completa:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Ejemplo conceptual:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=valor_de_tu_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Usa tus valores reales.

Nunca copies los valores de otro integrante.

---

# 6. Activar Firebase Authentication

Firebase Console:

```text
Authentication
→ Comenzar
→ Sign-in method / Método de acceso
```

Habilitar:

```text
Correo electrónico/Contraseña
```

No necesitas habilitar el enlace de correo electrónico.

Después revisa:

```text
Authentication
→ Settings / Configuración
→ Authorized domains / Dominios autorizados
```

Para desarrollo local debe estar permitido:

```text
localhost
```

---

# 7. Crear Firestore Database

Firebase Console:

```text
Firestore Database
→ Crear base de datos
```

Usar la base:

```text
(default)
```

Selecciona una región razonablemente cercana.

Las reglas temporales elegidas durante el asistente no importan porque en el siguiente paso reemplazaremos las reglas por las oficiales del proyecto.

---

# 8. Aplicar las reglas de EmprendeLink

En el repositorio existe:

```text
firestore.rules
```

Abre ese archivo.

Luego ve en Firebase:

```text
Firestore Database
→ Rules / Reglas
```

Reemplaza TODO el contenido del editor por el contenido completo de:

```text
firestore.rules
```

Luego presiona:

```text
Publish / Publicar
```

Estas reglas controlan directamente desde el navegador:

```text
users
businesses
plans
categories
products
```

Los pedidos utilizan Firebase Admin desde el servidor.

Las colecciones:

```text
orders
orderHistory
commissions
```

no deben ser modificadas directamente desde el navegador.

---

# 9. Crear la Service Account para Firebase Admin

EmprendeLink utiliza Firebase Admin para operaciones server-side como:

- crear pedidos;
- consultar pedidos;
- historial;
- cambio de estado;
- cálculo y creación de comisiones.

Cada integrante debe generar SU propia credencial.

Firebase Console:

```text
Configuración del proyecto
→ Service accounts
→ Firebase Admin SDK
→ Generate new private key
```

Firebase descargará un archivo JSON.

Ese archivo es PRIVADO.

Nunca:

```text
❌ subirlo a GitHub
❌ enviarlo al grupo
❌ ponerlo en Discord
❌ ponerlo en WhatsApp
❌ pegarlo en README
❌ colocarlo dentro del repositorio
```

---

# 10. Convertir la Service Account a una sola línea

El proyecto espera:

```env
FIREBASE_SERVICE_ACCOUNT_JSON=
```

El valor debe ser el JSON completo en una sola línea.

En PowerShell puedes obtenerlo con:

```powershell
Get-Content "RUTA\AL\ARCHIVO.json" -Raw |
  ConvertFrom-Json |
  ConvertTo-Json -Compress
```

Ejemplo:

```powershell
Get-Content "$HOME\Downloads\mi-service-account.json" -Raw |
  ConvertFrom-Json |
  ConvertTo-Json -Compress
```

PowerShell mostrará algo parecido a:

```text
{"type":"service_account","project_id":"...","private_key":"..."}
```

Copia la línea completa.

En `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Debe permanecer en una sola línea.

No agregues ese valor a `.env.example`.

---

# 11. Instalar el proyecto

Desde la raíz:

```bash
npm ci
```

`npm ci` utiliza exactamente las versiones guardadas en:

```text
package-lock.json
```

No instales versiones nuevas de dependencias por tu cuenta.

---

# 12. Comprobar el proyecto

Ejecuta:

```bash
npm test
```

Actualmente deben pasar:

```text
12 tests
```

Luego:

```bash
npm run check
```

Este comando ejecuta:

```text
ESLint
+
Next.js production build
```

Finalmente:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

También puedes probar:

```text
http://localhost:3000/api/health
```

---

# 13. Crear el primer ADMIN

La aplicación pública NO permite registrarse como ADMIN.

Esto es intencional.

Primero abre:

```text
http://localhost:3000/registro
```

Crea una cuenta como:

```text
Emprendedor
```

Después ve a:

```text
Firebase Console
→ Authentication
→ Users
```

Busca el usuario y copia su:

```text
UID
```

Luego:

```text
Firestore Database
→ Data
→ users
→ documento con ese UID
```

Cambia solamente:

```text
role
```

de:

```text
ENTREPRENEUR
```

a:

```text
ADMIN
```

Debe ser un campo tipo:

```text
string
```

No cambies:

```text
active
email
createdAt
```

Inicia sesión nuevamente.

Debes entrar a:

```text
/admin
```

---

# 14. Crear los planes iniciales

Con la cuenta ADMIN:

```text
/admin/planes
```

Si todavía no existen planes, utiliza:

```text
Crear planes base
```

Esto crea los planes iniciales del proyecto.

Un emprendimiento necesita un plan activo antes de poder crear su negocio.

---

# 15. Crear un Emprendedor real

Cierra sesión.

Registra otro correo como:

```text
Emprendedor
```

Debe ingresar a:

```text
/emprendedor
```

Luego configura:

```text
Configuración del negocio
```

Después crea:

```text
Categoría
→ Producto
→ Activar producto
```

---

# 16. Crear un Cliente

Cierra sesión.

Registra otro correo como:

```text
Cliente
```

Los datos obligatorios son:

```text
nombre
correo
teléfono
dirección
contraseña
```

Opcional:

```text
indicaciones de entrega
```

El Cliente puede:

```text
explorar negocios
agregar productos
usar carrito
hacer checkout
ver pedidos
ver perfil
```

---

# 17. Probar un pedido

Con un Emprendedor:

```text
crear negocio
crear categoría
crear producto
activar producto
```

Con Cliente:

```text
/
→ seleccionar negocio
→ agregar producto
→ carrito
→ checkout
→ confirmar pedido
```

El pedido debe aparecer en Firestore:

```text
orders
```

También debe crearse:

```text
orderHistory
```

Cuando el Emprendedor avance el pedido hasta:

```text
DELIVERED
```

se genera una comisión en:

```text
commissions
```

---

# 18. Colecciones utilizadas

La aplicación puede crear estas colecciones:

```text
users
businesses
plans
categories
products
orders
orderHistory
commissions
```

No necesitas crearlas manualmente.

Firestore las crea cuando se guarda el primer documento.

La única excepción práctica es que necesitas crear/configurar el primer ADMIN para comenzar a gestionar planes.

---

# 19. Índices de Firestore

Actualmente EmprendeLink no requiere un archivo de índices compuestos personalizado.

No crees índices al azar.

Si Firebase muestra un error indicando que una consulta necesita un índice, guarda el mensaje y consulta al equipo antes de modificar la configuración.

---

# 20. Imágenes

Actualmente los productos y logos utilizan:

```text
URL de imagen
```

No necesitas configurar Firebase Storage para trabajar con la versión actual del proyecto.

---

# 21. Qué NO compartir

Nunca compartir:

```text
.env.local
Service Account JSON
private_key
contraseñas
tokens de sesión
```

Sí se puede compartir:

```text
.env.example
firestore.rules
código fuente
documentación
estructura de datos
```

---

# 22. Si algo falla

Primero comprobar:

```bash
npm test
npm run check
```

Luego comprobar:

```text
.env.local
Authentication Email/Password
Firestore creado
firestore.rules publicadas
FIREBASE_SERVICE_ACCOUNT_JSON
```

Si necesitas ayuda de un LLM:

1. dile que lea `AGENTS.md`;
2. dile que lea `docs/LLM_CONTEXT.md`;
3. nunca le envíes tu Service Account;
4. nunca le envíes `.env.local` completo.

---

# Resultado esperado

Cada integrante debe terminar con:

```text
Código compartido
        +
Firebase propio
        +
.env.local propio
        +
usuarios propios
        +
datos propios
```

Ningún integrante necesita acceso administrativo al Firebase personal de otro integrante.
