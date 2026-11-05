# EmprendeLink Mobile — Etapa 3 Foro 2

Aplicación React Native con Expo SDK 57 integrada con el mismo Firebase y la misma API de Next.js
que la aplicación web.

## Funcionalidad

- Firebase Authentication con correo/contraseña y sesión persistente en AsyncStorage.
- Google Sign-In nativo enlazado a Firebase Authentication.
- creación y consulta de perfiles `users/{uid}`; el registro público nunca ofrece ADMIN.
- rechazo y cierre de sesión de perfiles con `active !== true`.
- negocios, categorías y productos activos leídos desde Firestore.
- carrito local; creación, listado, detalle e historial de pedidos mediante `/api/orders`.
- ID token de Firebase enviado como `Authorization: Bearer <token>` a la API.

Los precios, el cliente y la comisión nunca se aceptan como autoridad desde el teléfono: los Route
Handlers vuelven a consultar y validar esos datos antes de escribir con Firebase Admin.

## Preparación local

```bash
cd mobile
npm ci
Copy-Item .env.example .env
```

Completa `.env` con la configuración pública de la aplicación Web registrada en Firebase y con una
URL de la API accesible desde el dispositivo. No agregues una Service Account, claves privadas,
contraseñas ni tokens. En Android Emulator, el Next.js local normalmente se alcanza con
`http://10.0.2.2:3000`; un teléfono físico necesita la IP LAN de la computadora.

En Firebase Console habilita Email/Password y Google como proveedores. Publica también las reglas
del repositorio. Web y móvil deben usar el mismo `projectId` durante una prueba integrada.

## Google Sign-In y development build

Google Sign-In contiene código nativo y no funciona en Expo Go. La configuración de plugins ya está
en `app.json` y el perfil de development client en `eas.json`. Para Android:

1. registra la app `sv.edu.udb.emprendelink` en Firebase;
2. agrega las huellas SHA-1/SHA-256 del certificado de desarrollo;
3. descarga `google-services.json` dentro de `mobile/` (está ignorado por Git);
4. configura `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` con el OAuth Client ID de tipo Web;
5. genera e instala un development build y luego ejecuta `npm start`.

Para iOS registra `sv.edu.udb.emprendelink`, usa `GoogleService-Info.plist` y configura el URL scheme
que corresponda antes del build. Los archivos nativos están ignorados para evitar compartir por
accidente la configuración de un proyecto personal.

## Ejecución y verificación

```bash
npm start
npm test
npm run export:android
```

`npm test` usa adaptadores en memoria: no consulta Firebase real ni la API. `export:android` valida
que Metro pueda producir el bundle. Para probar Google se necesita el development build descrito
arriba; correo/contraseña y Firestore usan Firebase JS SDK.

## Arquitectura

```text
UI
↓
Context / hooks / validación
↓
Services
├── Firebase Authentication + Firestore (operaciones cliente permitidas)
└── Next.js Route Handlers (pedidos privilegiados)
    ↓
    Firebase Admin
```

`src/lib/firebase/client.js` es la única inicialización del SDK. Los services aceptan dependencias
inyectables para probar autenticación, consultas y HTTP sin tocar servicios reales.

## Alcance pendiente

El flujo funcional móvil de esta etapa es CUSTOMER. ENTREPRENEUR y ADMIN se enrutan a una salida
segura con logout; su administración completa continúa en la web. Debe probarse manualmente Google
Sign-In en un development build firmado y con las huellas del proyecto Firebase de cada integrante.
