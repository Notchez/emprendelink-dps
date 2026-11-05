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

El contrato de pedidos del backend no incluye `businessName`. `orderService` conserva ese contrato y
resuelve el nombre actual mediante `catalogService`; `businessName` se agrega únicamente al modelo de
presentación móvil. La lista consulta los negocios activos una sola vez y solo resuelve por ID los
negocios históricos que ya no estén activos.

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

### Compatibilidad verificada con Expo SDK 57

| Paquete | Versión fijada | Comprobación |
| --- | --- | --- |
| `expo` | `57.0.30` | SDK 57 usa React Native 0.86 y React 19.2 |
| `firebase` | `12.18.0` | Expo requiere Firebase 12 o posterior para evitar errores ESM |
| `@react-native-async-storage/async-storage` | `2.2.0` | versión incluida por Expo SDK 57 y usada por `getReactNativePersistence` |
| `expo-dev-client` | `57.0.20` | versión incluida por Expo SDK 57 |
| `@react-native-google-signin/google-signin` | `17.0.0` | declara soporte para Expo `>=52.0.40` |

Al ejecutar `expo install --check`, Expo recomienda `expo@~57.0.31` en lugar de la versión bloqueada
`57.0.30`. No se actualizó porque esta tarea no autoriza cambios adicionales de dependencias. Ambas
pertenecen a SDK 57 y el bundle Android compila; el ajuste de parche debe tratarse en una tarea de
mantenimiento aprobada junto con su lockfile.

Requisitos manuales de Firebase Console y del build:

1. habilitar **Email/Password** y **Google** en Authentication;
2. registrar la app Web para obtener las variables públicas `EXPO_PUBLIC_FIREBASE_*`;
3. registrar Android/iOS con los identificadores definidos en `app.json`;
4. agregar a Android las huellas SHA-1/SHA-256 del certificado de desarrollo y, al publicar, las
   huellas de Play App Signing;
5. descargar `google-services.json` o `GoogleService-Info.plist`; `app.config.js` los incorpora solo
   cuando existen localmente y Git los ignora;
6. usar el OAuth Client ID de tipo Web en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`;
7. reconstruir el development build cuando cambien plugins, identificadores o archivos nativos.

Firebase JS SDK permite correo/contraseña y Firestore con Expo. El development build es obligatorio
para Google Sign-In porque `@react-native-google-signin/google-signin` agrega un módulo nativo.

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
