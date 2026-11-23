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

### Interfaz de Cliente

Las pantallas CUSTOMER utilizan como referencia visual la versión responsive de la web:
barra superior con acceso al carrito y perfil, navegación inferior por Negocios / Pedidos / Perfil,
tarjetas compactas con imágenes completas (`contain`), tema automático claro/oscuro según el
sistema Android o iOS y detalles de pedido con identificadores `PED-XXXXXXXX`.
Los pedidos se separan en «En curso» e «Historial» y mantienen
el enlace a su detalle; los logos de los negocios se resuelven desde Firestore, incluso para
pedidos históricos, con un icono de respaldo cuando no hay imagen.
El carrito replica la composición responsive de la web: tarjeta de negocio y productos,
control de cantidad, opción de vaciar, resumen, subtotal y pago contra entrega.
**Continuar** abre el checkout nativo para revisar los datos de contacto, indicar una dirección
específica para ese pedido, confirmar el método de pago y ver una pantalla de confirmación.
**Mi perfil** permite editar nombre, teléfono, dirección e indicaciones sin alterar rol,
correo ni estado de la cuenta. Estas pantallas conservan la navegación y los controles nativos
de React Native. El contenedor reserva el área inferior de
gestos/botones del sistema Android para que no se superponga a las pestañas.

La apariencia utiliza `useColorScheme` y se actualiza cuando el usuario cambia el tema del
dispositivo; no se guarda una preferencia ni se ofrece un interruptor dentro de la aplicación.

### Paneles de administrador y emprendedor

Los perfiles `ADMIN` y `ENTREPRENEUR` ya no son redirigidos a pantallas de espera.
Tienen un panel nativo con cabecera, menú desplegable, tarjetas, formularios y colores
claros/oscuros equivalentes al shell responsive de Next.js. No se usa WebView ni se
ejecuta HTML/CSS dentro de React Native.

- **Administrador:** indicadores globales, comisiones del mes por emprendimiento,
  compradores (consulta y activación/desactivación), emprendimientos (visibilidad y cambio
  de plan), administración de planes, pedidos con detalle/historial/cambio de estado,
  ventas y comisiones. Los apartados financieros muestran tarjetas de resumen, selector
  de mes, totales históricos y emprendimientos con detalle desplegable, siguiendo el
  diseño responsive web.
- **Emprendedor:** resumen del negocio, alta/edición de negocio, categorías, productos,
  consulta y actualización de pedidos, reporte de ventas y estado de cuenta de comisiones.
  Ventas y comisiones permiten seleccionar el mes y consultar el histórico; las ventas
  agrupan por fecha de entrega en El Salvador y las comisiones por mes UTC, igual que web.
- **Cuenta:** el correo electrónico se muestra como dato fijo en los tres roles.
  La edición de perfil solo permite nombre, teléfono, dirección e indicaciones.

Las operaciones de pedidos, comisiones, activación de compradores y cambio de plan usan
la API protegida de Next.js con el Firebase ID token. Las operaciones de negocios,
planes, categorías y productos usan Firestore respetando sus reglas de roles.
**Next.js debe permanecer encendido y ser accesible desde el celular** para cargar
pedidos, ventas y comisiones. Los cambios administrativos requieren una cuenta ADMIN
activa; un cliente no obtiene permisos administrativos por instalar la app.

El diseño traduce la jerarquía visual y los flujos principales a componentes nativos;
la comprobación de detalles de responsive y gestos se hace en un dispositivo real.

Para Android, **se necesita `expo-system-ui`**: instalar desde `mobile/` con
`npx expo install expo-system-ui` antes de verificar la exportación. La opción
`userInterfaceStyle: automatic` y el plugin están declarados en `app.json`.
Este módulo nativo exige volver a crear e instalar el development build con
`npx eas build --profile development --platform android` antes de comprobar
el cambio automático del tema en un Samsung. Un reinicio de Metro no reemplaza
esa reconstrucción nativa.

Para validar el diseño en un teléfono Android, inicia el development build previamente instalado,
ejecuta `npx expo start --dev-client --clear --lan` y comprueba las tres pestañas, búsqueda de
negocios/productos, imágenes, carrito, pedidos y cierre de sesión. La exportación Metro y las
pruebas automáticas no sustituyen esta revisión visual en un dispositivo físico.

Los precios, el cliente y la comisión nunca se aceptan como autoridad desde el teléfono: los Route
Handlers vuelven a consultar y validar esos datos antes de escribir con Firebase Admin.

El contrato de pedidos del backend no incluye `businessName` ni `businessLogoUrl`.
`orderService` conserva ese contrato y resuelve nombre/logo actuales mediante `catalogService`;
ambos campos se agregan únicamente al modelo de presentación móvil. La lista consulta los
negocios activos una sola vez y solo resuelve por ID los negocios históricos que ya no estén
activos. La dirección/indicaciones elegidas en checkout se envían como datos del pedido y no
modifican el perfil; los precios los valida siempre el servidor.

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

1. registra la app `com.emprendelink.app` en Firebase;
2. agrega las huellas SHA-1/SHA-256 del certificado de desarrollo;
3. descarga `google-services.json` dentro de `mobile/` (está ignorado por Git);
4. configura `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` con el OAuth Client ID de tipo Web;
5. genera e instala un development build y luego ejecuta `npm start`.

Para iOS registra `com.emprendelink.app`, usa `GoogleService-Info.plist` y configura el URL scheme
que corresponda antes del build. Los archivos nativos están ignorados para evitar compartir por
accidente la configuración de un proyecto personal.

### Compatibilidad verificada con Expo SDK 57

| Paquete | Versión fijada | Comprobación |
| --- | --- | --- |
| `expo` | `57.0.33` | SDK 57 usa React Native 0.86 y React 19.2 |
| `firebase` | `12.18.0` | Expo requiere Firebase 12 o posterior para evitar errores ESM |
| `@react-native-async-storage/async-storage` | `2.2.0` | versión incluida por Expo SDK 57 y usada por `getReactNativePersistence` |
| `expo-dev-client` | `~57.0.21` | versión recomendada por Expo SDK 57 |
| `@react-native-google-signin/google-signin` | `17.0.0` | declara soporte para Expo `>=52.0.40` |

Las versiones de Expo y del development client se actualizaron dentro de SDK 57 durante la
revisión de seguridad de dependencias. Tras actualizar `expo-dev-client`, hay que comprobar
la aplicación en el teléfono y reconstruir el development build antes de darlo por validado.

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
