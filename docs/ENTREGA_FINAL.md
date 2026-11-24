# Entrega final — EmprendeLink DPS941

**Fecha de cierre documental:** 24 de noviembre de 2026.
**Repositorio:** https://github.com/Notchez/emprendelink-dps
**Video de defensa:** https://drive.google.com/file/d/1QbS6Q21RjCO1KAxpJVTVR_uC7G1SOpJi/view?usp=drive_link

> El enlace debe configurarse en Google Drive con permisos de lectura para el docente. El repositorio no contiene el video ni credenciales.

## Objetivo y alcance implementado

EmprendeLink es una plataforma web y Android para negocios, catálogos, pedidos y reportes. Los tres roles
se implementan en **Next.js** y en pantallas **nativas React Native/Expo**:

| Rol          | Web y Android                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| CUSTOMER     | Negocios, catálogo, productos, carrito, checkout, historial/detalle de pedidos y perfil.             |
| ENTREPRENEUR | Panel de negocio, categorías, productos, atención de pedidos, ventas, estado de comisiones y perfil. |
| ADMIN        | Dashboard, compradores, emprendimientos, planes, pedidos, ventas/comisiones por mes y perfil.        |

Google Sign-In y correo/contraseña utilizan Firebase Authentication. Firestore conserva perfiles y
catálogos. Las operaciones privilegiadas de pedidos, historial y comisiones usan API Next.js + Firebase
Admin en el servidor. Las cuentas ADMIN no se habilitan en el registro público.

## Arquitectura

`Next.js/React (web)` y `React Native/Expo (Android)` comparten el mismo proyecto Firebase durante
una prueba integrada. La aplicación móvil no usa WebView para los paneles; usa `screens`, `Context`,
`services` y `React Navigation`. La API recibe `Authorization: Bearer <Firebase ID token>`, valida
sesión, rol y propiedad. El servidor recalcula precios, fija el plan/tasa al crear el pedido y crea una sola
comisión al pasar a `DELIVERED`. `CANCELLED` no produce comisión.

## Validación técnica reproducible

Desde la raíz (Node.js 24):

```powershell
npm ci
npm test
npm run check
```

Desde `mobile/`:

```powershell
npm ci
npm test
npm run export:android
```

CI está definido en `.github/workflows/ci.yml` para push/PR hacia `develop` y `main`.
**El resultado del pipeline se debe verificar en el commit/PR de entrega final; este documento no
certifica que una ejecución concreta haya pasado.** El export de Metro valida el bundle, no prueba
el APK físico ni OAuth en un dispositivo.

## Demostración y criterios

1. Presentación del problema, roles y tecnologías — 10 minutos.
2. Explicación del código React Native (`mobile/App.js`, Firebase cliente, autenticación, navegación,
   contextos, servicios, reportes) e integración mínima con API — 20 minutos.
3. Demostración Android con cuentas de los tres roles, compra, atención de pedido, historial, ventas
   y comisiones — 30 minutos.

La base de demostración incluyó registros temporales para visualizar períodos de ventas y comisiones.
No representan compras reales.

## Datos de demostración: retirar después de la defensa

El seeder local `scripts/seed-demo-orders.mjs` **no debe versionarse ni distribuirse con el
producto**. Utiliza una marca `demoSeed` para limitar la limpieza a los documentos que creó.
Desde la raíz, con el archivo todavía disponible y credenciales locales válidas:

```powershell
node --env-file=.env.local scripts/seed-demo-orders.mjs --cleanup-preview
# Revisar el recuento y SOLO después:
node --env-file=.env.local scripts/seed-demo-orders.mjs --cleanup --project=emprendelink-dps
```

**Advertencia:** el segundo comando elimina pedidos demo, sus historiales y sus comisiones
en Firestore del proyecto indicado. Nunca limpiar sin revisar previamente el proyecto objetivo
y los registros marcados. No eliminar por rango de fechas ni tocar registros reales. Esta guía
no afirma que la limpieza ya se ejecutó.

## Aspectos no confirmados y próximos pasos

- Publicación en Google Play / App Store: no documentada como realizada.
- CD de producción en Vercel y URL pública: configuración final no verificada; CI sí está definido.
- Licencia general del código/documentación: depende de decisión del equipo; ver `LICENSING.md`.
- Pruebas manuales de OAuth, seguridad por roles, tema claro/oscuro y API LAN deben comprobarse
  en el APK real en cada entorno de entrega.
- El servidor Next.js debe estar disponible por red para consultar pedidos, ventas y comisiones
  desde el celular. La IP LAN del equipo puede cambiar por DHCP.

## Flujo de publicación de Git

`docs/entrega-final-*` → PR a `develop` → CI verde → PR `develop` a `main` → CI verde.
No subir archivos de entorno, Service Accounts, tokens ni seeders temporales.
