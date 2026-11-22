# Panel Emprendedor: revisión de experiencia y reportes

Esta iteración conserva las rutas y los contratos existentes de EmprendeLink.
Todos los pedidos, ventas y comisiones se consultan por las APIs autenticadas;
el backend sigue limitando el acceso al propietario de cada negocio.

## Inicio y catálogo

- El inicio destaca hasta seis pedidos activos recientes (pendiente, confirmado,
  en preparación o listo), excluyendo entregados y cancelados.
- Cada tarjeta permite abrir `/orders/[id]`.
- Las imágenes de productos se muestran completas (`object-fit: contain`), sin
  recortar el producto cuando tiene proporciones distintas a la tarjeta.
- La gestión de categorías permanece sin cambios.

## Pedidos

- Se conserva la operación de los estados y el historial.
- Se puede filtrar por nombre del cliente (sin distinguir tildes), identificador,
  contacto, estado, fecha de creación y fecha de entrega.
- La fecha de entrega usa el registro de comisión cuando el pedido no tiene
  campo `deliveredAt`, siguiendo el criterio del panel Admin.
- Las tarjetas incluyen productos, datos de contacto, entrega y enlace a detalle.
- En el detalle se muestra tanto el código corto `PED-XXXXXXXX` como el ID
  completo de Firestore, además de productos, totales, historial y comisión.

## Ventas y PDF

- La opción **Ventas** mantiene la ruta `/emprendedor/reportes`.
- Solo los pedidos `DELIVERED` contribuyen a las ventas; las cancelaciones
  quedan excluidas. El período se filtra por fecha de entrega en El Salvador.
- El total histórico no cambia al elegir fechas.
- **Generar PDF** abre un reporte A4 en otra pestaña y el diálogo de impresión
  del navegador. En Chrome se elige **Guardar como PDF**. No se genera Excel
  ni se agregan dependencias externas para PDF.

## Comisiones

- La opción **Comisiones** mantiene la ruta `/emprendedor/estado-cuenta`.
- Muestra comisiones del mes seleccionado y acumulado histórico por separado.
- El selector mensual usa UTC, como el panel Admin, y conserva los meses
  históricos; los detalles enlazan al pedido correspondiente.

## Verificación manual recomendada

1. Con una sesión `ENTREPRENEUR`, entrar a `/emprendedor` y contrastar los
   pedidos activos con `/orders`.
2. Abrir `/emprendedor/productos` y comprobar imágenes de distintas proporciones.
3. Filtrar pedidos por nombre, fechas y estado, luego consultar un detalle.
4. Entrar a **Ventas**, seleccionar un período con entregas y guardar el PDF.
5. Entrar a **Comisiones**, cambiar de mes y abrir un pedido desde su fila.
6. Verificar la navegación en móvil y que ningún emprendedor pueda consultar
   los pedidos o las comisiones de otro negocio.
