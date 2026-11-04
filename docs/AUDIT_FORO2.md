# Auditoría técnica — preparación de Etapa 3 Foro 2

Fecha de revisión: 4 de noviembre de 2026.

## Alcance

Se revisaron la aplicación web, la aplicación móvil, contratos, services, mocks, documentación,
reglas de Firestore, archivos ignorados, dependencias y CI. La integración de Firebase en React
Native quedó deliberadamente fuera de alcance.

## Hallazgos resueltos

- Se eliminó un `AuthContext` web duplicado y sin consumidores.
- Se eliminó la cadena mock web de pedidos, comisiones y dashboard que había sido reemplazada por
  Firebase/servicios reales y no tenía imports activos.
- Se eliminaron componentes y validadores web sin referencias comprobadas.
- La consulta Firestore de la página de usuarios se trasladó a `adminService`, restaurando el flujo
  UI → service → Firebase/API.
- Las dos guías Firebase se unificaron en `docs/FIREBASE_SETUP.md` y se corrigieron referencias.
- El job `validate` de CI ahora comprueba web y móvil, incluido el export Android de Expo.
- El aviso MIT de Expo se conservó como aviso de terceros para no confundirlo con una licencia
  general de EmprendeLink.

Los mocks y services de `mobile/` se conservaron porque siguen sosteniendo la aplicación y sus
pruebas mientras Firebase móvil está pendiente.

## Seguridad

- No se encontraron credenciales versionadas ni contenido de Service Accounts.
- `.env`, `.env.local`, variantes locales, Service Accounts, llaves móviles, `mobile/dist/` y
  `mobile/.expo/` están ignorados por Git.
- `firestore.rules` mantiene bloqueado el acceso cliente a pedidos, historial y comisiones; esas
  operaciones continúan en Route Handlers con Firebase Admin.
- No se modificaron reglas funcionales ni contratos de datos.

## Dependencias pendientes

`npm audit` se ejecutó en modo de solo lectura; no se usó `npm audit fix` ni se instalaron paquetes.

| Proyecto | Resultado | Dependencias directas destacadas |
| --- | --- | --- |
| Web | 24 entradas: 14 moderadas, 9 altas y 1 crítica | `next`, `firebase`, `eslint-config-next` |
| Móvil | 16 entradas: 2 bajas, 11 moderadas y 3 altas | `expo` y dependencias transitivas |

La entrada crítica web afecta a la versión fijada de Next.js y el registro indica una corrección en
una versión posterior. El árbol móvil propone subir de Expo SDK 57 a SDK 58 para varias correcciones.
No se aplicaron esos cambios porque actualizar versiones y lockfiles requiere aprobación del equipo,
pruebas de compatibilidad y, en el caso de Expo, una migración coordinada. No se recomienda ejecutar
`npm audit fix --force`.

## Licencia pendiente

El repositorio todavía no tiene una licencia general. `docs/LICENSING.md` documenta la decisión
pendiente sobre la variante Creative Commons exigida, su alcance y la separación respecto de los
avisos de terceros.
