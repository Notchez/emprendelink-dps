# Revisión de seguridad de dependencias — 18 de noviembre de 2026

## Alcance y resultado

Se revisaron **por separado** los árboles de dependencias del proyecto web (raíz)
y de React Native (`mobile/`). El punto de partida era:

| Proyecto | Vulnerabilidades antes | Después |
| --- | --- | --- |
| Web | 24 (1 crítica, 9 altas, 13 moderadas, 1 baja) | 0 según `npm audit` |
| Android/Expo | 15 (7 altas, 8 moderadas) | 0 según `npm audit` |

El resultado de `npm audit` solo cubre avisos conocidos sobre dependencias npm;
**no acredita por sí solo la seguridad de Firestore, las reglas, los endpoints ni las credenciales**.

## Cambios principales

- **Web:** Next.js y `eslint-config-next` de 16.3.3 a 16.4.6, sin cambiar
  la versión mayor; actualizaciones transitivas compatibles en `package-lock.json`.
- **Móvil:** Expo dentro de SDK 57, de ~57.0.30 a ~57.0.33, y
  `expo-dev-client` de 57.0.20 a ~57.0.21; actualizaciones transitivas
  en `mobile/package-lock.json`.
- **Firebase:** se conserva `firebase@12.18.0` y `firebase-admin@14.x`.
  No se ejecutó `npm audit fix --force`, porque proponía cambiar a ramas
  mayores/incompatibles con el proyecto.
- **Dependencias indirectas:** los `overrides` documentados abajo eliminan
  vulnerabilidades en dependencias que todavía reciben versiones afectadas
  desde paquetes upstream.

### Overrides explícitos

| Proyecto | Dependencia | Versión forzada | Motivo |
| --- | --- | --- | --- |
| Web y móvil | `@firebase/firestore` → `@grpc/grpc-js` | 1.14.7 | El SDK de Firestore seguía instalando una rama antigua de gRPC para Node. |
| Web | `google-gax` → `rimraf` | 6.1.4 | La rama 5 heredaba versiones afectadas de `glob` y `minimatch`. |
| Web | `uuid` transitivo | ^11.1.1 | Sustituye una rama antigua usada por dependencias de Google Cloud. |
| Móvil | `@expo/fingerprint` → `minimatch` | 11.0.9 | Evita la versión transitiva con aviso de denegación de servicio. |

**Precaución:** un override puede superar la versión declarada por el mantenedor
original, aunque `npm audit` quede en cero. Mantener pruebas de regresión
y revisar estos overrides cuando Firebase, Google Cloud y Expo publiquen
dependencias corregidas. No quitarlos sin volver a auditar.

## Validación realizada

- Instalación limpia de ambos proyectos: `npm ci --no-audit --no-fund`.
- Web: 16 pruebas automatizadas aprobadas; `npm run check` pasó (ESLint y build Next.js).
- Móvil: 40 pruebas automatizadas aprobadas; `npm run export:android` completado.
- Expo: `npx expo install --check` informó dependencias actualizadas.
- `npm audit` mostró **0 vulnerabilidades** en cada proyecto.

## Pruebas que todavía requieren ejecución manual

1. Arrancar Next.js y probar los tres roles con las cuentas autorizadas del proyecto;
   comprobar catálogo, administración, pedidos y comisiones contra Firestore real.
2. Probar el login Google web y la navegación por roles desde un dominio autorizado.
3. **Reconstruir e instalar el development build Android** tras actualizar
   `expo-dev-client`; comprobar Google Sign-In, persistencia, catálogo,
   carrito y creación de un pedido real en el Samsung de pruebas.
4. Antes de integrar a `develop`, revisar el PR y repetir el CI sobre el commit final.

Para repetir la auditoría en Windows PowerShell, ejecutar desde la raíz:

```powershell
npm ci
npm audit
npm test
npm run check

cd mobile
npm ci
npm audit
npx expo install --check
npm test
npm run export:android
```

Una auditoría limpia no es motivo para publicar sin las pruebas manuales anteriores.

## Vigencia de los resultados

Este informe registra el resultado de la auditoría del **18/11/2026**, no el estado garantizado de
las dependencias en cualquier fecha posterior. Para una entrega nueva volver a ejecutar
`npm audit` en la raíz y dentro de `mobile/`; conservar el resultado de CI asociado al commit
final. No cambiar lockfiles o versiones únicamente para modificar la documentación.
