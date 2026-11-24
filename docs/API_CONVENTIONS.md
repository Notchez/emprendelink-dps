# Convenciones API REST

## Base

Los Route Handlers viven en:

```text
src/app/api/
```

## Respuesta exitosa

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Respuesta de error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción legible"
  }
}
```

## Códigos HTTP

- `200` consulta/actualización correcta.
- `201` recurso creado.
- `400` datos inválidos.
- `401` no autenticado.
- `403` autenticado sin permiso.
- `404` recurso inexistente.
- `409` conflicto de regla de negocio cuando aplique.
- `500` error inesperado.

## Nombres

Preferir sustantivos en plural. **Rutas implementadas relevantes:**

```text
/api/health
/api/orders
/api/orders/[id]
/api/orders/[id]/history
/api/orders/[id]/status
/api/orders/[id]/financials
/api/commissions
/api/customers
/api/admin/users/[id]/status
/api/admin/businesses/[id]/plan
```

Negocios, productos, categorías y planes no tienen todos un endpoint CRUD propio: varias
operaciones autorizadas usan los services y el SDK de Firestore cliente. No afirmar que
`/api/products` o `/api/plans` existen sin implementarlos.

## UI que consume API

Siempre contemplar:

- loading;
- success;
- empty;
- error.

Nunca asumir que una petición siempre tendrá éxito.
