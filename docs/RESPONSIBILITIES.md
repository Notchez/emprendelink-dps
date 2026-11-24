# Responsabilidades por integrante — módulo web

Estas responsabilidades siguen siendo la referencia de propiedad funcional para la aplicación web.
La aplicación móvil reutiliza los mismos contratos y no cambia la propiedad de los dominios.

## Integrante 1 — Autenticación, roles y usuarios

- registro;
- login/logout;
- persistencia de sesión;
- AuthContext;
- rutas protegidas;
- roles;
- menú/layout según rol;
- gestión administrativa básica de emprendedores;
- services de auth/usuarios.

No desarrolla productos, pedidos ni reportes.

---

## Integrante 2 — Negocio, categorías, productos e imágenes

- perfil/configuración del emprendimiento;
- categorías;
- productos;
- activar/desactivar;
- imágenes;
- formularios y validaciones;
- límite de productos activos por plan;
- services/API del dominio.

No desarrolla catálogo público ni ciclo de pedidos.

---

## Integrante 3 — Catálogo público, carrito y cliente

- catálogo por emprendimiento;
- categorías/productos visibles;
- detalle de producto;
- carrito/selección;
- cantidades y subtotal;
- datos del cliente;
- checkout;
- confirmación;
- responsive.

Prepara y envía el pedido, pero no administra su ciclo de vida.

---

## Integrante 4 — Pedidos y lógica central

- creación/procesamiento del pedido recibido;
- listado y detalle;
- estados y transiciones;
- cancelación;
- historial;
- actualización dinámica;
- generación de comisión al llegar a DELIVERED;
- API de pedidos.

No desarrolla carrito ni dashboards.

---

## Integrante 5 — Dashboard, reportes, planes y administración financiera

- dashboard emprendedor;
- dashboard administrador;
- KPI;
- gráfica(s);
- reportes;
- filtros por período;
- planes;
- consulta de comisiones;
- estados de cuenta;
- services/API correspondientes.

Consume comisiones generadas por pedidos; no redefine esa regla.

---

## Obligatorio para todos

- UI / lógica / datos separadas;
- validaciones;
- loading/error/empty;
- responsive;
- commits propios;
- PR;
- documentación mínima;
- poder defender su código.

## Entrega multiplataforma

La asignación anterior describe la división funcional del **módulo web**; no equivale a una
atribución de commits móviles por persona. La versión React Native incorpora los tres roles y
reutiliza los contratos compartidos. Consultar `mobile/README.md` y `docs/ENTREGA_FINAL.md`
para el alcance final. La historia de contribuciones verificable está en los commits y PR de GitHub.
