# Guion de video — Etapa 3 Foro 1

Duración máxima: **15 minutos**. La grabación debe mostrar la aplicación real ejecutándose en
Android o Expo Go. Las diapositivas pueden apoyar, pero no sustituir la demostración.

## Preparación antes de grabar

- Ejecutar `cd mobile && npm ci && npm start`.
- Abrir la app en emulador o teléfono y verificar que las imágenes cargan.
- Tener preparado el correo `cliente@emprendelink.demo` y contraseña `Demo1234`.
- Cerrar notificaciones personales y no mostrar `.env.local`, Firebase Console ni secretos.
- Usar resolución legible y aumentar el tamaño del editor si se mostrará código.
- Realizar un ensayo cronometrado; objetivo recomendado: 13:30–14:30 minutos.

## 0:00–1:00 — Introducción

**Mostrar:** portada breve y repositorio/branch.

**Narrar:**

> Somos el equipo de EmprendeLink para DPS941. En esta Etapa 3, Foro 1, desarrollamos un avance
> móvil real con React Native y Expo. La meta fue implementar autenticación, navegación y el módulo
> principal sin adelantar la conexión Firebase del Foro 2. La aplicación web permanece intacta y el
> móvil vive en la carpeta `mobile` del mismo repositorio.

## 1:00–2:00 — Figma y UX/UI

**Mostrar:** app en Login y luego una captura de la web cliente, si está disponible.

**Narrar:**

> El repositorio no contiene un enlace verificable al Figma original, por lo que no afirmamos haber
> accedido a ese archivo. Usamos como fuente visual la experiencia web actual: azul principal,
> superficies claras, tarjetas, búsqueda y navegación del cliente. La adaptación móvil utiliza áreas
> seguras, targets táctiles, teclado, scroll, feedback de carga y una navegación inferior natural.

## 2:00–4:00 — Arquitectura React Native

**Mostrar:** árbol `mobile/src` y, rápidamente, `App.js`, `navigation`, `services` y `data`.

**Narrar:**

> `App.js` solo compone providers y navegación. Las pantallas consumen contextos y hooks; estos
> invocan services; los services consumen datos temporales. Ninguna pantalla importa mocks.
> `mockData` respeta contratos reales de User, Business, Product y Order. En Foro 2 podremos cambiar
> los services por Firebase y las API seguras sin rehacer la interfaz.

Explicar:

- Auth stack: Login y Registro.
- Bottom tabs: Negocios, Pedidos y Perfil.
- App stack: Catálogo, Producto, Carrito y Detalle de pedido.
- Contextos: sesión, carrito y pedidos.

## 4:00–6:00 — Login y registro

**Mostrar:** Login, envío vacío, correo inválido, mostrar contraseña, cuenta demo y Registro.

**Narrar:**

> Las validaciones están fuera de la UI. Login muestra errores por campo y error del servicio.
> Registro permite CUSTOMER o ENTREPRENEUR, igual que la web; ADMIN no aparece. CUSTOMER exige
> teléfono y dirección. La contraseña requiere ocho caracteres, una letra, un número y confirmación.
> El botón presenta loading y evita envíos duplicados.

Finalizar entrando con la cuenta demo.

## 6:00–11:00 — Navegación y módulo principal

### 6:00–7:15 — Negocios

- Mostrar cards, búsqueda y resultado sin coincidencias.
- Abrir un negocio.

### 7:15–8:30 — Catálogo

- Filtrar por categoría y buscar texto.
- Mostrar contador del carrito y abrir un producto.

### 8:30–9:30 — Producto y carrito

- Cambiar cantidad.
- Agregar al carrito.
- Modificar cantidad y mostrar subtotal.

### 9:30–10:20 — Confirmación temporal

- Confirmar pedido.
- Aclarar que se crea en memoria con estado `PENDING`, sin tocar Firebase real.

### 10:20–11:00 — Pedidos y perfil

- Abrir pedido y mostrar items, estado y entrega.
- Cambiar a Perfil y enseñar datos/cierre de sesión, sin confirmar logout todavía.

## 11:00–13:00 — Validaciones y componentes reutilizables

**Mostrar:** `validation.js`, `AppInput`, `AppButton`, `StateView`, `theme` y una pantalla.

**Narrar:**

> El sistema visual centraliza colores, espaciado, tipografía, radios y sombras. Inputs y botones
> reutilizan estados de error, loading y accesibilidad. Listas usan FlatList; formularios se adaptan
> al teclado; imágenes tienen fallback; loading, error y vacío son estados explícitos. El carrito
> impide mezclar negocios porque un pedido real solo admite un `businessId`.

## 13:00–14:00 — Código y verificación

**Mostrar:** terminal con resultados ya ejecutados o volver a ejecutar comandos si el tiempo permite.

```bash
cd mobile
npm test
npm run export:android
```

Luego mencionar la validación web:

```bash
cd ..
npm test
npm run check
```

**Narrar:**

> Las pruebas cubren validaciones de login, registro, requisitos por rol y contraseñas. La exportación
> Android obliga a Metro a resolver todo el árbol de imports. La CI web se conserva sin cambios.

## 14:00–15:00 — Conclusión

**Mostrar:** navegación rápida por las tres tabs y finalmente Perfil.

**Narrar:**

> El Foro 1 queda con autenticación temporal funcional, navegación completa y experiencia cliente
> demostrable. No incluimos Firebase móvil para respetar el alcance. Foro 2 sustituirá los services
> por Authentication, Firestore y Route Handlers, conservando pantallas y contratos. Como pendientes
> de evidencia quedan incorporar las capturas reales al PDF y validar contra el Figma autorizado.

Cerrar sesión para demostrar que el flujo vuelve a Login.

## Lista de tomas obligatorias

- Login y validación.
- Registro y selector de rol.
- Negocios y búsqueda.
- Catálogo y filtros.
- Detalle, cantidad y carrito.
- Confirmación y pedido `PENDING`.
- Lista y detalle de pedido.
- Perfil y logout.
- Árbol de arquitectura.
- Resultados de pruebas.

## Control de tiempo

Si una sección se extiende, recortar explicación de código, nunca la demostración funcional.
No mostrar instalación completa ni esperar descargas durante la grabación.
