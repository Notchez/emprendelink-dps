# Dashboard administrativo — Entrega final DPS941

## Navegación

- `/admin`: resumen global y comisiones del mes por emprendimiento.
- `/admin/compradores`: compradores registrados, ficha de contacto y activación o suspensión de su acceso.
- `/admin/emprendimientos`: emprendimientos, planes y publicación de sus catálogos.
- `/admin/emprendimientos/[id]`: desempeño individual, métricas y evolución de comisiones.
- `/orders` con rol ADMIN: abre con negocios activos y permite combinar negocio, estado,
  rango de fecha de creación y rango de fecha de entrega. La vista de pedidos del EMPRENDEDOR
  se conserva y su búsqueda también acepta nombre, correo y teléfono del comprador.
- `/admin/ventas`: total histórico de pedidos entregados y selector mensual (igual que
  Comisiones), desglose por negocio del período y enlaces a los detalles de cada pedido.
- `/admin/comisiones`: total del mes seleccionado, acumulado histórico (lifetime),
  comisiones agrupadas por negocio y enlaces a detalles mensuales y pedidos.
- `/admin/usuarios`: ruta anterior, redirige a compradores para no romper enlaces.

## Cálculos de comisiones

- Los importes provienen de `/api/commissions`, que exige una sesión ADMIN para consultar todos los negocios.
- `adminCommissionInsights.js` agrupa `commission.amount` por `commission.businessId` y por el mes UTC de `commission.createdAt`.
- El total mensual incluye comisiones históricas válidas aunque un negocio ya no figure en la colección actual.
- El gráfico de la portada presenta los emprendimientos ordenados de mayor a menor comisión mensual; un negocio sin comisión muestra $0.00.
- La ficha del emprendimiento muestra la tendencia de los últimos seis meses de comisiones, ventas de pedidos `DELIVERED` y estadísticas históricas.
- En la tendencia solo se dibujan barras azules para meses con comisiones positivas; los meses en $0.00 se identifican por su etiqueta y línea base, sin rectángulos grises de altura completa.
- La suma de **ventas entregadas** (`order.subtotal`) no equivale a las **comisiones ganadas** (`commission.amount`). No mezclarlas.
- Las comisiones se crean en el backend al llegar el pedido a `DELIVERED`; la interfaz solo consulta datos existentes.
- Para filtrar pedidos por **fecha de entrega**, la interfaz administrativa utiliza
  `commission.createdAt` del pedido. El contrato actual de `orders` no almacena `deliveredAt`;
  para pedidos entregados antiguos sin comisión registrada no existe una fecha fiable.
- Las fechas de creación y entrega en los filtros de pedidos se interpretan en horario
  de El Salvador, mientras que los meses de comisión mantienen el criterio UTC del dashboard.
- El selector de Ventas utiliza el mes UTC de entrega del pedido (fecha de comisión
  cuando `deliveredAt` no existe). El total histórico sigue incluyendo todos los
  pedidos entregados, aunque algunos antiguos carezcan de fecha de entrega fiable.
- Las listas de pedidos y transacciones muestran bloques incrementales, evitando miles de
  filas en el DOM. La consulta completa de Firestore se conserva por compatibilidad con el
  backend actual; la paginación del lado del servidor será necesaria al crecer el volumen.

## Arquitectura y seguridad

`AdminDashboard` y `AdminBusinessDetail` muestran información sin consultar directamente Firebase.
`adminService` utiliza Firestore cliente para leer documentos permitidos por las reglas y la API protegida para pedidos y comisiones. Las operaciones administrativas existentes (estado de clientes, plan y visibilidad de negocios) mantienen sus servicios y permisos originales.

El layout propio `DashboardShell` reemplaza únicamente `@adminlte/react`, reutiliza los menús de `dashboardMenus.js` y conserva el selector claro/oscuro/sistema. Las rutas principales `/admin` y `/emprendedor` se marcan activas solamente cuando coinciden exactamente.

## Pruebas de aceptación pendientes en entorno real

1. Probar los enlaces y el sombreado del menú en todas las rutas de ADMIN y EMPRENDEDOR.
2. Verificar visualmente escritorio y móvil con temas claro/oscuro.
   Comprobar especialmente una tendencia con un solo mes positivo y el resto en $0.00.
3. Confirmar importes de comisiones del mes con Firestore y el listado `/admin/comisiones`.
4. Cambiar plan y publicar/ocultar un negocio; verificar comportamiento sin recargar.
5. Desactivar/reactivar comprador y confirmar restricción de acceso del usuario.
6. Confirmar que el rol CLIENTE nunca accede al layout administrativo ni a datos de otros usuarios.
7. Probar un negocio activo y uno inactivo en pedidos; combinar filtros de ambas fechas
   y comprobar que una cancelación no se considera entregada.
8. En ventas y comisiones, contrastar los totales y abrir un pedido desde el detalle de negocio.
   Probar meses con $0.00, históricos y operaciones de negocios ya eliminados.
