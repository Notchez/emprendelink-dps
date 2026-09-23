# Configuración y prueba de cuentas — EmprendeLink DPS

Esta entrega conecta cuentas y perfiles con Firebase y exige cuenta de cliente para confirmar pedidos.
No se crean cuentas reales al copiar los archivos: hay que completar los pasos siguientes en tu proyecto Firebase.
No se requiere una librería adicional ni una clave privada de cuenta de servicio.

## 1. Aplicar archivos

1. Detener `npm run dev` con Ctrl+C.
2. Copiar el contenido del paquete en la raíz `emprendelink-dps`, combinando carpetas y reemplazando los archivos coincidentes. No eliminar la carpeta src.
3. Conservar los valores existentes de `.env.local`. Nunca compartir ese archivo ni las contraseñas.
4. `npm run check` comprueba lint y build, pero no sustituye las pruebas contra tu Firebase.

## 2. Activar Firebase Authentication

1. Abrir https://console.firebase.google.com/ y seleccionar el proyecto usado en `.env.local`.
2. Authentication → Comenzar (si aparece) → Método de acceso / Sign-in method.
3. Habilitar el proveedor Correo electrónico/Contraseña y guardar. No hace falta habilitar enlace por correo.
4. En Authentication → Configuración → Dominios autorizados, comprobar que `localhost` esté incluido para pruebas locales.
5. En Firestore Database → Reglas, conservar una copia de las reglas anteriores y publicar el contenido completo de `firestore.rules` de este paquete.
   Estas reglas corresponden a las colecciones del proyecto DPS: users, businesses, plans, categories y products.
   Los clientes solo pueden crear CUSTOMER o ENTREPRENEUR; no pueden asignarse ADMIN ni editar su rol.

Si el registro alcanza a crear el acceso pero falla el perfil, publica/corrige las reglas,
inicia sesión con ese mismo correo y completa `/completar-perfil`. No vuelvas a registrar otro acceso.

## 3. Crear las tres cuentas

Ejecutar `npm run dev`. Usar tres correos distintos y contraseñas elegidas por ti, de al menos 8 caracteres.
Usar correos a los que tengas acceso si quieres probar recuperación de contraseña.

### Administrador

1. Ir a http://localhost:3000/registro y crear primero una cuenta de tipo Emprendedor con el correo que destinarás al administrador.
2. Cerrar sesión.
3. En Firebase → Authentication → Usuarios, localizar ese correo y copiar su UID.
4. En Firestore → Datos → users → documento cuyo ID sea ese UID, editar únicamente `role` (tipo string) a `ADMIN`. Mantener `active` (boolean) en true.
5. Iniciar sesión en http://localhost:3000/login. Debe abrir `/admin`.

El UID debe ser exactamente el mismo; no crear un documento con el correo como ID.
No hay una opción pública para registrarse como administrador.

### Emprendedor

1. Cerrar la sesión anterior.
2. Registrarse con otro correo y el tipo Emprendedor.
3. Debe abrir `/emprendedor`.

### Cliente

1. Cerrar la sesión anterior.
2. Registrarse con otro correo y el tipo Cliente.
3. Completar nombre, correo, teléfono y dirección; opcionalmente indicaciones de entrega.
4. Definir y confirmar la contraseña.
5. Debe abrir `/cliente`, con sus datos y la sección Mis pedidos.

Para comparar cuentas simultáneamente, usar perfiles de navegador diferentes o un navegador diferente.
Las pestañas normales del mismo perfil comparten sesión y el cierre de sesión se propaga.

## 4. Preparar un negocio real para probar compras

El catálogo ahora lee Firestore. Ya no inventa productos al fallar una ruta.
Por eso `/catalogo/mi-tienda` solo funcionará si existe un negocio con ese identificador.

Si `plans` no tiene un plan activo, crear en Firestore → Datos una colección `plans` y un documento `plan-pruebas`:

| Campo | Tipo en Firebase | Valor de prueba |
| --- | --- | --- |
| name | string | Plan de pruebas |
| maxActiveProducts | number | 20 |
| commissionRate | number | 0.03 |
| active | boolean | true |

No duplicarlo si ya tienes un plan apropiado. Las pantallas administrativas de planes aún usan mocks y pueden mostrar otros valores.

Con la cuenta Emprendedor:

1. Ir a Configuración del negocio y crear el negocio, su identificador de catálogo y seleccionar un plan activo.
2. Crear una categoría.
3. Crear un producto asociado a la categoría y activarlo. Los productos nuevos comienzan inactivos.
4. Abrir `/` para encontrar el negocio y su catálogo.

## 5. Prueba por roles

- Sin sesión: consultar el catálogo y agregar productos. Al ir a `/checkout`, redirige a login conservando el carrito. El enlace Crear cuenta conserva el destino de compra.
- Cliente: iniciar sesión desde checkout; debe volver a confirmar el pedido con nombre, teléfono y correo de su cuenta. Puede ajustar dirección e indicaciones para esa compra.
- Cliente: Mi cuenta permite editar nombre, teléfono, dirección e indicaciones. No cambia correo ni rol.
- Cliente: consultar solo sus pedidos y su historial; no muestra botones para cambiar estado.
- Emprendedor: abrir Pedidos; debe mostrar los del negocio asociado a su UID, no `business-001` fijo.
- Emprendedor: cambiar estado y comprobar el nuevo estado desde la cuenta cliente con Actualizar pedidos.
- Administrador: acceder a `/admin`. Para probar la vista general de pedidos, abrir `/orders`.
- Cerrar sesión y recargar una ruta protegida: debe volver a login.
- Intentar abrir `/admin` con la cuenta cliente: no debe mostrar el panel.
- Recuperar contraseña: usar el botón correspondiente en login con tu correo.
- Confirmar que modo claro/oscuro/automático continúa funcionando en los paneles internos.

La API también comprueba sesión, rol y propiedad. Cambiar un customerId/changedBy en el navegador
no cambia la identidad real. El servidor consulta los precios en Firestore al crear el pedido.

## 6. Qué queda pendiente

- Las cuentas y perfiles sí se guardan en Firebase.
- Los pedidos, historial y comisiones permanecen en memoria mediante los servicios mock existentes.
  Pueden desaparecer al reiniciar y no son apropiados para varias instancias de servidor.
  La migración a Firestore con transacciones es el siguiente paso antes de usar pedidos reales.
- Dashboards/reportes/planes administrativos y algunos estados de cuenta todavía incluyen datos de demostración.
- El límite de productos del plan se valida en el flujo actual de UI; su refuerzo transaccional en servidor queda pendiente.
- No se implementa envío real de avisos al emprendedor ni pagos.
- Las rutas internas bloquean la UI por rol; los datos privados reales necesitan autorización del servidor por cada operación, como ya se hace en las APIs de pedidos.

## Verificación técnica de esta entrega

- `npm run check`: lint y build.
- `node --import ./tests/register-aliases.mjs --test ./tests/account-access.test.mjs`: 12 pruebas de validación, identidad y autorización con Firebase simulado. No crean cuentas ni envían solicitudes a Firebase real.
- Las reglas de Firestore y los flujos de registro/login necesitan la prueba manual contra tu proyecto. No se ejecutó el emulador de reglas ni se crearon cuentas en tu proyecto desde esta entrega.

No dar por aprobada toda la aplicación solo porque compile. Completar estas pruebas con el Firebase real antes de hacer commit/PR.
