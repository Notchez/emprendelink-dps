# Pruebas de cuentas y roles — EmprendeLink

Esta guía explica cómo preparar y probar:

```text
ADMIN
ENTREPRENEUR
CUSTOMER
```

Antes de utilizarla debes completar:

```text
docs/FIREBASE_SETUP.md
```

---

# 1. Requisitos

Debes tener:

```text
Firebase Authentication activo
Firestore activo
firestore.rules publicadas
.env.local configurado
Firebase Admin configurado
planes creados
```

Ejecutar:

```bash
npm run dev
```

---

# 2. Administrador

El registro público NO permite crear ADMIN.

Primero registra una cuenta como:

```text
ENTREPRENEUR
```

Después:

```text
Firebase Console
→ Authentication
→ Users
```

Copia el UID.

Luego:

```text
Firestore
→ users
→ UID del usuario
```

Cambia:

```text
role: "ENTREPRENEUR"
```

por:

```text
role: "ADMIN"
```

Mantén:

```text
active: true
```

Después inicia sesión nuevamente.

Debe abrir:

```text
/admin
```

Prueba:

```text
Dashboard
Usuarios
Planes
Ventas
Comisiones
```

---

# 3. Emprendedor

Registra otro correo como:

```text
ENTREPRENEUR
```

Debe acceder a:

```text
/emprendedor
```

Prueba:

```text
Configuración del negocio
Categorías
Productos
Pedidos
Reportes
Estado de cuenta
```

Crea:

```text
1 negocio
1 categoría
1 producto
```

Activa el producto.

---

# 4. Cliente

Registra otro correo como:

```text
CUSTOMER
```

Debe tener:

```text
nombre
correo
teléfono
dirección
contraseña
```

Opcional:

```text
deliveryInstructions
```

Prueba:

```text
Negocios
Catálogo
Carrito
Checkout
Pedidos
Mi perfil
```

---

# 5. Prueba completa de compra

Con Emprendedor:

```text
crear negocio
crear categoría
crear producto
activar producto
```

Con Cliente:

```text
abrir /
seleccionar negocio
agregar producto
abrir carrito
checkout
confirmar pedido
```

Comprueba en Firestore:

```text
orders
orderHistory
```

El pedido comienza en:

```text
PENDING
```

---

# 6. Estados del pedido

Los estados válidos son:

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

El Cliente:

```text
puede consultar sus pedidos
NO puede cambiar estados
NO puede consultar pedidos ajenos
```

El Emprendedor:

```text
puede consultar pedidos de su negocio
puede realizar transiciones permitidas
NO puede administrar pedidos de otro negocio
```

El ADMIN:

```text
puede consultar pedidos globales
```

---

# 7. Comisión

Cuando un pedido llega a:

```text
DELIVERED
```

el servidor crea una comisión.

Debe aparecer en:

```text
commissions
```

La tasa utilizada queda asociada al pedido al momento de crearlo.

Modificar posteriormente el plan no debe cambiar retroactivamente la comisión de ese pedido.

---

# 8. Persistencia real

Actualmente se guardan en Firebase:

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

Los pedidos, historial y comisiones NO son datos mock.

Sus operaciones server-side utilizan:

```text
Firebase Admin SDK
```

---

# 9. Seguridad básica a comprobar

Cliente intentando:

```text
/admin
```

no debe obtener acceso.

Cliente intentando modificar el estado de un pedido:

```text
debe fallar
```

Cliente intentando consultar un pedido ajeno:

```text
debe fallar
```

Emprendedor intentando consultar pedidos de otro negocio:

```text
debe fallar
```

Usuario desactivado:

```text
no debe poder operar normalmente
```

---

# 10. Pruebas automatizadas

Ejecuta:

```bash
npm test
```

Actualmente existen:

```text
12 pruebas
```

Cubren entre otros:

```text
autenticación
roles
acceso a pedidos
identidad
validaciones
transiciones
protección contra datos falsificados
```

Estas pruebas NO escriben en tu Firebase real.

Durante los tests, la persistencia de pedidos se reemplaza temporalmente por memoria.

Eso permite probar la lógica sin ensuciar la base de datos.

---

# 11. Validación técnica

Ejecuta:

```bash
npm test
npm run check
```

Los dos deben terminar correctamente antes de un Pull Request.

---

# 12. Sesiones múltiples

Si quieres tener:

```text
ADMIN
ENTREPRENEUR
CUSTOMER
```

abiertos al mismo tiempo, usa:

```text
perfiles diferentes del navegador
```

o:

```text
navegadores diferentes
```

Varias pestañas del mismo perfil comparten la misma sesión Firebase.

---

# Resultado esperado

Debes poder demostrar:

```text
Cliente compra
        ↓
pedido PENDING
        ↓
Emprendedor procesa
        ↓
historial se actualiza
        ↓
pedido DELIVERED
        ↓
comisión creada
```
