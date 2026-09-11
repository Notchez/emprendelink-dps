# Responsabilidades por integrante — Etapa 2

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
