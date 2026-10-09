# Contratos de datos — EmprendeLink

Estos contratos representan las estructuras compartidas actuales.

No cambiar nombres de campos o significados sin coordinación del equipo.

---

# User

Colección:

```text
users
```

ID del documento:

```text
Firebase Auth UID
```

Estructura:

```js
{
  id: "string",
  name: "string",
  email: "string",
  role: "ADMIN | ENTREPRENEUR | CUSTOMER",
  phone: "string",
  address: "string",
  deliveryInstructions: "string",
  createdAt: "ISO date",
  active: true
}
```

`deliveryInstructions` puede ser cadena vacía.

La contraseña nunca se almacena en Firestore.

Firebase Authentication administra la contraseña.

---

# Business

Colección:

```text
businesses
```

```js
{
  id: "string",
  ownerId: "Firebase Auth UID",
  name: "string",
  slug: "string",
  logoUrl: "string | null",
  planId: "string",
  active: true
}
```

Un Emprendedor solo debe administrar su propio Business.

---

# Category

Colección:

```text
categories
```

```js
{
  id: "string",
  businessId: "string",
  name: "string",
  active: true
}
```

---

# Product

Colección:

```text
products
```

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

---

# Customer

No existe una colección independiente `customers`.

Un Cliente es un documento de:

```text
users
```

con:

```js
role: "CUSTOMER";
```

Su ID es el UID de Firebase Authentication.

---

# Plan

Colección:

```text
plans
```

```js
{
  id: "string",
  name: "string",
  maxActiveProducts: 10,
  commissionRate: 0.03,
  active: true
}
```

Importante:

```text
commissionRate
```

se guarda como decimal.

Ejemplo:

```text
3% = 0.03
7% = 0.07
```

---

# Order

Colección:

```text
orders
```

```js
{
  id: "string",

  businessId: "string",

  customerId: "Firebase Auth UID",

  customer: {
    name: "string",
    phone: "string",
    email: "string"
  },

  items: [],

  subtotal: 0,

  deliveryAddress: "string",

  notes: "string | null",

  status: "PENDING",

  createdAt: "ISO date",

  commissionPlanId: "string",

  commissionPlanName: "string",

  commissionRate: 0.03
}
```

Los campos:

```text
customer
productName
unitPrice
commissionPlanId
commissionPlanName
commissionRate
```

guardan información histórica.

Si posteriormente cambia el usuario, producto o plan, un pedido existente debe conservar la información utilizada cuando fue creado.

---

# Order Item

Dentro de:

```text
order.items
```

```js
{
  productId: "string",
  productName: "string",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0
}
```

El servidor consulta el producto real.

No confiar en el precio enviado por el navegador.

---

# Order status

Valores permitidos:

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

No inventar valores nuevos sin cambiar el contrato oficial.

---

# Order History

Colección:

```text
orderHistory
```

```js
{
  orderId: "string",
  oldStatus: "string | null",
  newStatus: "string",
  changedBy: "Firebase Auth UID",
  changedAt: "ISO date"
}
```

Al crear un pedido:

```text
oldStatus = null
newStatus = PENDING
```

---

# Commission

Colección:

```text
commissions
```

El documento utiliza actualmente el ID del pedido para impedir múltiples comisiones por el mismo pedido.

```js
{
  id: "orderId",
  orderId: "string",
  businessId: "string",
  rate: 0.03,
  amount: 0,
  createdAt: "ISO date",
  planId: "string | opcional"
}
```

Se crea únicamente cuando el pedido llega a:

```text
DELIVERED
```

---

# Persistencia

Actualmente estas colecciones utilizan Firebase/Firestore real:

```text
users
businesses
plans
categories
products
orders
orderHistory
commissions
```

Pedidos, historial y comisiones utilizan Firebase Admin desde el servidor.

---

# Autorización

El servidor verifica identidad utilizando Firebase Authentication.

Nunca confiar en valores proporcionados por el navegador para determinar:

```text
customerId
changedBy
rol
propietario
precio
```

CUSTOMER:

```text
solo sus pedidos
```

ENTREPRENEUR:

```text
solo pedidos de su negocio
```

ADMIN:

```text
acceso administrativo permitido por las rutas correspondientes
```

---

# Regla final

Antes de cambiar uno de estos contratos revisar:

```text
services
Route Handlers
firestore.rules
tests
UI que consume el dato
documentación
```

Un cambio de contrato debe coordinarse con el equipo.
