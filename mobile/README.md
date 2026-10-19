# EmprendeLink Mobile — Etapa 3 Foro 1

Aplicación móvil académica de EmprendeLink construida con React Native y Expo. Esta entrega
demuestra autenticación temporal, navegación y el módulo principal de cliente sin conectarse
todavía a Firebase.

## Requisitos

- Node.js 24.x, igual que el proyecto web.
- npm.
- Android Studio con un emulador, o un teléfono Android con Expo Go compatible con SDK 57.
- Windows, macOS o Linux para ejecutar Expo. El simulador de iOS requiere macOS.

## Instalación

Desde la raíz del repositorio:

```bash
cd mobile
npm ci
```

No ejecutes `npm audit fix --force`: podría cambiar las versiones compatibles con Expo.

## Ejecutar la aplicación

```bash
npm start
```

Expo mostrará un código QR y opciones interactivas:

- presiona `a` para abrir un emulador Android;
- escanea el QR con Expo Go en un dispositivo de la misma red;
- si la red local bloquea la conexión, prueba `npx expo start --tunnel`;
- `npm run android` inicia Expo e intenta abrir Android directamente.

Cuenta de demostración:

```text
Correo: cliente@emprendelink.demo
Contraseña: Demo1234
```

También puedes crear una cuenta desde Registro. Las cuentas creadas y los pedidos nuevos viven
solo durante la ejecución actual porque Foro 1 usa servicios mock en memoria. Un pedido creado sí
permanece al hacer pull-to-refresh o al salir y volver a Pedidos durante esa ejecución; se pierde al
reiniciar la aplicación.

## Flujo funcional

```text
Login / Registro
        ├── CUSTOMER → Tabs: Negocios · Pedidos · Perfil
        │                    ↓
        │       Negocio → Catálogo → Producto → Carrito → Pedido
        │                                             ↓
        │                                     Mis pedidos → Detalle
        └── ENTREPRENEUR / ADMIN → aviso de módulo futuro → Cerrar sesión
```

No hay botones decorativos: las acciones principales navegan, validan, modifican el carrito,
crean un pedido temporal o cierran sesión.

## Pantallas

- `LoginScreen`: validación, error de credenciales, loading, mostrar/ocultar contraseña y acceso demo.
- `RegisterScreen`: rol CUSTOMER/ENTREPRENEUR, validaciones y registro temporal.
- `RolePendingScreen`: salida segura y profesional para ENTREPRENEUR/ADMIN sin suplantar el flujo
  CUSTOMER; informa el alcance y permite cerrar sesión.
- `BusinessesScreen`: búsqueda, loading, error, vacío y acceso a catálogo.
- `CatalogScreen`: búsqueda, categorías, productos y acceso al carrito.
- `ProductDetailScreen`: imagen, cantidad, total y agregado al carrito.
- `CartScreen`: cantidades, eliminación, subtotal y confirmación de pedido temporal.
- `OrdersScreen`: listado, pull-to-refresh, estados y acceso al detalle; conserva pedidos creados
  durante la ejecución actual.
- `OrderDetailScreen`: productos, subtotal y entrega.
- `ProfileScreen`: datos de la cuenta y logout.

## Arquitectura

```text
mobile/
├── App.js
├── src/
│   ├── components/   UI reutilizable
│   ├── constants/    roles y estados oficiales
│   ├── context/      sesión, carrito y pedidos
│   ├── data/         datos temporales centralizados
│   ├── hooks/        carga de negocios y catálogo
│   ├── navigation/   selección por rol, auth stack, app stack y bottom tabs
│   ├── screens/      pantallas auth, módulo cliente y estado de roles futuros
│   ├── services/     frontera reemplazable de datos
│   ├── theme/        colores, spacing, tipografía, radios y sombras
│   └── utils/        validaciones y formatos puros
└── tests/            pruebas unitarias sin Firebase
```

El flujo obligatorio del proyecto también se aplica al móvil:

```text
UI → Context/hooks/lógica → Services → mockData
```

Las pantallas no importan `mockData`. Los services devuelven el mismo envelope documentado
por la API web: `success`, `data` y `error`.

## Contratos y Firebase futuro

Los mocks respetan `docs/DATA_CONTRACTS.md`: `User`, `Business`, `Category`, `Product`,
`Order` y `Order Item`. Los roles se limitan a `ADMIN`, `ENTREPRENEUR` y `CUSTOMER`; los
pedidos usan únicamente estados oficiales. `orderService` inicializa una colección runtime a
partir del seed sin mutar `mockOrders`, guarda allí cada pedido nuevo y usa esa misma colección al
refrescar.

Para Foro 2 se reemplazarán principalmente:

- `src/services/authService.js` por Firebase Authentication y perfil Firestore;
- `src/services/catalogService.js` por consultas permitidas a negocios/categorías/productos;
- `src/services/orderService.js` por los Route Handlers seguros de pedidos.

No se debe confiar en precios, identidad, rol o propiedad enviados por el teléfono. La creación
real de pedidos debe seguir validándose server-side mediante Firebase Admin, igual que en web.

## Diseño y accesibilidad

La identidad visual deriva de la experiencia cliente web actual: azul `#2563EB`, fondos claros,
tarjetas, radios amplios y navegación inferior. No se encontró un enlace de Figma accesible en
el repositorio, por lo que no se afirma una comparación visual directa con el archivo original.
El icono móvil combina un emprendimiento local con eslabones para representar la conexión entre
negocios y clientes; no contiene texto para conservar legibilidad en tamaños pequeños.

Se incluyeron áreas seguras, scroll, adaptación al teclado, `FlatList`, targets táctiles de al
menos 40–50 px, labels de accesibilidad, feedback de loading, errores, estados vacíos y contraste.

## Validación técnica

```bash
npm test
npm run export:android
npx expo-doctor
```

`export:android` genera un bundle de producción en `mobile/dist/` para detectar imports o
errores de Metro. `dist/` y `.expo/` están ignorados por Git. Las 18 pruebas actuales cubren
validaciones, invariantes del carrito, almacenamiento runtime de pedidos y selección de flujo por
rol.

## Limitaciones de Foro 1

- No hay persistencia después de reiniciar la app; los pedidos solo sobreviven refresh durante la
  ejecución actual.
- No hay Firebase Authentication ni Google Sign-In móvil.
- No se realizan lecturas o escrituras Firestore desde el móvil.
- El módulo móvil implementado se concentra en la experiencia de cliente. El rol emprendedor puede
  registrarse, pero recibe una pantalla informativa con logout y no puede acceder a negocios,
  carrito ni pedidos como CUSTOMER. El panel móvil de emprendedor corresponde a trabajo futuro.
- Una eventual sesión ADMIN recibe la misma salida segura; el registro público no ofrece ese rol.
- Las imágenes de demostración requieren conexión a internet; existe fallback visual si fallan.
