# EmprendeLink — DPS941

Proyecto de cátedra de **Diseño y Programación de Software Multiplataforma (DPS941)**.

EmprendeLink es una plataforma para microemprendedores que permite administrar negocios, productos, catálogos, clientes, pedidos, planes, comisiones y reportes.

---

# Integrantes

- Marvin Francisco Pérez Calderón — PC253641
- Rafael Mena Mejia — MM253045
- Tito Mauricio Nochez Villagran — NV101005
- Luis Miguel Granados Artiga — GA130557
- Jorge Alfonzo Mendoza Padilla — MP241100

Link de video: https://drive.google.com/file/d/1QbS6Q21RjCO1KAxpJVTVR_uC7G1SOpJi/view?usp=drive_link

---

# Antes de comenzar

Si acabas de clonar el repositorio, empieza por:

```text
START_HERE.md
```

Después lee:

```text
AGENTS.md
CONTRIBUTING.md
docs/FIREBASE_SETUP.md
```

---

# Stack del proyecto

| Herramienta          | Versión / decisión                        |
| -------------------- | ----------------------------------------- |
| Node.js              | 24.x                                      |
| Next.js              | 16.4.6                                    |
| React                | 19.2.7                                    |
| Firebase JS SDK      | 12.18.0                                   |
| Firebase Admin       | 14.x                                      |
| React Native         | 0.86.3                                    |
| Expo                 | SDK 57                                    |
| React Navigation     | 7.x                                       |
| Lenguaje             | JavaScript                                |
| Router               | App Router                                |
| Estilos              | CSS + CSS Modules                         |
| Estado               | Context API + hooks                       |
| Panel interno        | Layout propio React + CSS Modules         |
| UI base panel        | Bootstrap + Bootstrap Icons               |
| Testing              | Node Test Runner + tsx                    |
| CI                   | GitHub Actions                            |
| CD                   | Vercel — pendiente de configuración final |
| Control de versiones | Git + GitHub                              |

No cambiar dependencias, versiones o arquitectura compartida sin aprobación del equipo.

---

# Roles

## ADMIN

Puede administrar:

```text
compradores (consulta y control de acceso)
emprendimientos (planes, publicación y desempeño)
planes
ventas
comisiones
dashboard de comisiones mensuales por negocio
```

ADMIN no se crea desde el registro público.

Las rutas, los cálculos del dashboard y los escenarios de prueba están documentados en
`docs/ADMIN_DASHBOARD.md`.

---

## ENTREPRENEUR

Puede administrar:

```text
su negocio
categorías
productos
pedidos
reportes
estado de cuenta
```

Solo debe acceder a los datos de su propio negocio.

---

## CUSTOMER

Puede:

```text
explorar negocios
consultar catálogos
usar carrito
realizar pedidos
consultar sus pedidos
editar su perfil
```

El catálogo puede consultarse públicamente.

Confirmar un pedido requiere una cuenta CUSTOMER autenticada.

---

# Arquitectura

```text
UI / componentes
      ↓
Context / hooks / lógica
      ↓
Services / Route Handlers
      ↓
Firebase
```

Los componentes visuales no deben contener acceso directo complejo a datos ni reglas críticas de negocio.

Ver:

```text
docs/ARCHITECTURE.md
```

---

# Firebase

Cada integrante del equipo utiliza su propio Firebase durante desarrollo.

```text
Mismo código
   ↓
Firebase diferente por desarrollador
```

No necesitas acceso al Firebase de otro integrante. Durante las pruebas integradas, la web y el
móvil pueden apuntar al mismo proyecto Firebase para compartir autenticación y datos; esto no
requiere compartir Service Accounts personales.

Configuración completa:

```text
docs/FIREBASE_SETUP.md
```

---

# Variables de entorno

Crear:

```text
.env.local
```

desde:

```text
.env.example
```

Windows:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Nunca subir `.env.local`.

Variables necesarias:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_JSON
```

---

# Instalación

```bash
git clone https://github.com/Notchez/emprendelink-dps.git
cd emprendelink-dps
git switch main
npm ci
```

Luego configura Firebase:

```text
docs/FIREBASE_SETUP.md
```

Finalmente:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

---

# Aplicación móvil — entrega final DPS941

El repositorio incluye una aplicación independiente en:

```text
mobile/
```

Está construida con React Native, Expo SDK 57 y React Navigation. Mantiene la separación:

```text
Pantallas y componentes
        ↓
Context / hooks / validaciones
        ↓
Services
        ↓
Firebase cliente / API Next.js protegida
```

La aplicación móvil implementa login, registro, Google Sign-In, sesión persistente y pantallas
nativas para **CUSTOMER, ENTREPRENEUR y ADMIN**. Incluye catálogos con imágenes, carrito,
checkout, pedidos con detalle e historial, gestión de negocios/categorías/productos, gestión
administrativa de planes, compradores y emprendimientos, además de ventas y comisiones con filtros
mensuales. Los pedidos y operaciones privilegiadas utilizan Route Handlers protegidos.

La integración comparte Firebase Authentication y Firestore con la web durante pruebas
integradas. Las operaciones privilegiadas de pedidos seguirán usando la API de Next.js y Firebase
Admin en el servidor; ninguna credencial administrativa debe incluirse en la aplicación móvil.

Instalación y ejecución:

```bash
cd mobile
npm ci
npm start
```

Correo/contraseña puede ejecutarse con el SDK cliente; Google Sign-In requiere un development build
porque incorpora código nativo y no funciona en Expo Go.
Consulta la guía completa en `mobile/README.md`.

Validación móvil:

```bash
cd mobile
npm test
npm run export:android
```

# Scripts

Desarrollo:

```bash
npm run dev
```

Tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Validación completa:

```bash
npm run check
```

`npm run check` ejecuta:

```text
lint
+
build
```

Antes de un Pull Request ejecutar:

```bash
npm test
npm run check
```

---

# CI

GitHub Actions valida automáticamente Pull Requests hacia:

```text
develop
main
```

El pipeline ejecuta:

```text
Web: npm ci → npm test → npm run check
Móvil: npm ci → npm test → npm run export:android
```

Si el check:

```text
validate
```

falla, el cambio no debe integrarse.

Ver:

```text
docs/CI_CD.md
```

---

# Git

Ramas permanentes:

```text
main
develop
```

Flujo:

```text
develop
   ↓
feature / fix / docs / chore
   ↓
Pull Request
   ↓
CI
   ↓
develop
```

Cuando existe una versión estable:

```text
develop
   ↓
Pull Request
   ↓
CI
   ↓
main
```

Nunca trabajar directamente sobre `main`.

Ver:

```text
docs/GIT_WORKFLOW.md
```

---

# Estados de pedido

Usar únicamente:

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELLED
```

No inventar estados nuevos.

---

# Datos persistidos

Actualmente Firebase contiene:

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

Pedidos, historial y comisiones se administran server-side mediante Firebase Admin.

---

# Uso de LLM

Si ChatGPT, Claude, Copilot u otro asistente puede leer el repositorio:

```text
debe leer AGENTS.md antes de modificar código
```

También debe consultar los documentos relevantes dentro de:

```text
docs/
```

Si NO puede leer el repositorio, copia y pega:

```text
docs/LLM_CONTEXT.md
```

Nunca compartir con un LLM:

```text
.env.local
Service Accounts
private keys
contraseñas
tokens
```

---

# Contratos comunes

Documentación:

```text
docs/DATA_CONTRACTS.md
docs/API_CONVENTIONS.md
docs/RESPONSIBILITIES.md
```

No cambiar contratos compartidos unilateralmente.

---

# Documentación

```text
START_HERE.md
README.md
AGENTS.md
CONTRIBUTING.md

docs/ARCHITECTURE.md
docs/INDEX.md
docs/ENTREGA_FINAL.md
docs/archivo/AUDIT_FORO2.md
docs/API_CONVENTIONS.md
docs/DATA_CONTRACTS.md
docs/FIREBASE_SETUP.md
docs/GIT_WORKFLOW.md
docs/CI_CD.md
docs/LLM_CONTEXT.md
docs/LICENSING.md
docs/PRUEBAS_CUENTAS.md
docs/RESPONSIBILITIES.md
```

---

# Definición de terminado

Una funcionalidad debe:

```text
funcionar
validar entradas
manejar errores
manejar loading cuando aplique
manejar estado vacío cuando aplique
ser responsive
respetar roles
respetar arquitectura
no incluir secretos
pasar tests
pasar lint
pasar build
```

Antes del PR:

```bash
npm test
npm run check

cd mobile
npm test
npm run export:android
```

---

# Regla final

Si un cambio afecta:

```text
arquitectura
Firebase
autenticación
roles
contratos
dependencias
reglas de negocio
CI/CD
```

debe comunicarse al equipo antes de integrarse.

## Estado de la entrega final — 24/11/2026

La implementación incluye una aplicación web con Next.js y una app nativa Android con React Native/Expo; ambas utilizan el mismo proyecto Firebase en las pruebas integradas. El video de defensa está enlazado después de los integrantes. La evidencia técnica, pruebas, rutas y límites conocidos se encuentran en [docs/ENTREGA_FINAL.md](docs/ENTREGA_FINAL.md).

**No confundir entrega académica con despliegue público:** CD en Vercel, publicación en tiendas y decisión de licencia general no se documentan como completadas sin evidencia. La aplicación móvil necesita la API Next.js accesible desde el teléfono para pedidos, ventas y comisiones.

**Datos temporales de defensa:** el seeder local se ejecutó para preparar pedidos de demostración. No es parte del producto ni se publica; antes de utilizar la base de datos para otros fines debe ejecutarse su limpieza controlada, descrita en la guía de entrega.
