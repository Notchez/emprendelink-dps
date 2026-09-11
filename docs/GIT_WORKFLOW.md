# Flujo Git del equipo

## Ramas permanentes

- `main`: versiones estables / entregables.
- `develop`: integración de trabajo terminado.

## Ramas temporales

```text
feature/<modulo>-<descripcion>
fix/<modulo>-<descripcion>
docs/<descripcion>
```

## Flujo

```text
develop
  ↓ crear rama
feature/...
  ↓ commits
Pull Request
  ↓ revisión
develop
```

Cuando exista una versión estable:

```text
develop → Pull Request → main
```

## Recomendación de commits

Un commit = una intención clara.

Bien:

```text
feat(products): add create product form
feat(products): connect product list to service
fix(products): enforce active plan limit
```

Evitar un único commit gigante al final.

## Conflictos

1. No borrar código ajeno por intuición.
2. Identificar qué cambió en ambas ramas.
3. Hablar con el responsable del módulo si hay duda.
4. Probar después de resolver.
