# Contratos de datos iniciales

Estos contratos son conceptuales. Antes de cambiar nombres compartidos, discutirlo con el equipo.

## User

```js
{
  id: "string",
  name: "string",
  email: "string",
  role: "ADMIN | ENTREPRENEUR",
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

```js
{
  id: "string",
  businessId: "string",
  name: "string",
  phone: "string",
  email: "string | null"
}
```

## Order

```js
{
  id: "string",
  businessId: "string",
  customerId: "string",
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
