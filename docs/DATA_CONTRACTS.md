# Contratos de datos iniciales

Estos contratos son conceptuales. Antes de cambiar nombres compartidos, discutirlo con el equipo.

## User

```js
{
  id: "string",
  name: "string",
  email: "string",
  role: "ADMIN | ENTREPRENEUR | CUSTOMER",
  phone: "string",
  address: "string",
  deliveryInstructions: "string", // Opcional: cadena vacía si no hay indicaciones.
  createdAt: "ISO date",
  active: true
}
```

## Business

```js
{
  id: "string",
  ownerId: "string",
  name: "string",
  slug: "string",
  logoUrl: "string | null",
  planId: "string",
  active: true
}
```

## Category

```js
{
  id: "string",
  businessId: "string",
  name: "string",
  active: true
}
```

## Product

```js
{
  id: "string",
  businessId: "string",
  categoryId: "string",
  name: "string",
  description: "string",
  price: 0,
  imageUrl: "string | null",
  active: true
}
```

## Customer

El cliente ahora es un User con role CUSTOMER. Su id es el UID de Firebase Authentication.
No se crea otra identidad por compra ni por negocio. Nombre, correo, teléfono y dirección
son obligatorios. La contraseña solo se administra en Firebase Authentication.

## Order

```js
{
  id: "string",
  businessId: "string",
  customerId: "Firebase Auth UID",
  customer: { name: "string", phone: "string", email: "string" }, // Copia al crear el pedido.
  items: [],
  subtotal: 0,
  deliveryAddress: "string",
  notes: "string | null",
  status: "PENDING",
  createdAt: "date"
}
```

## Order item

```js
{
  productId: "string",
  productName: "string",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0
}
```

## Order status history

```js
{
  orderId: "string",
  oldStatus: "string | null",
  newStatus: "string",
  changedBy: "string",
  changedAt: "date"
}
```

## Plan

```js
{
  id: "string",
  name: "string",
  maxActiveProducts: 0,
  commissionRate: 0,
  active: true
}
```

## Commission

```js
{
  id: "string",
  orderId: "string",
  businessId: "string",
  rate: 0,
  amount: 0,
  createdAt: "date"
}
```

## Autorización y estado de integración

El servidor verifica el token con Firebase Auth REST y consulta users/{uid} mediante Firestore REST.
CUSTOMER ve solo sus pedidos; ENTREPRENEUR solo los de su negocio; ADMIN ve todos.
customerId y changedBy se determinan en el servidor, no desde el cuerpo de la solicitud.
Los precios se consultan en products; no se acepta el precio del navegador.
Las cuentas se persisten en Firebase. Pedidos, historial, comisiones y dashboards siguen usando
los servicios mock existentes; aún falta migrarlos para persistencia real y pruebas completas.
