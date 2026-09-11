# Contribución a EmprendeLink

## 1. Antes de comenzar

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<modulo>-<descripcion>
```

Ejemplo:

```bash
git checkout -b feature/products-create
```

## 2. Durante el trabajo

- Trabajar únicamente el alcance de la tarea.
- No mezclar varias funcionalidades grandes en el mismo commit.
- No subir secretos.
- No cambiar dependencias sin avisar.
- Ejecutar periódicamente:

```bash
npm run lint
```

## 3. Antes del Pull Request

```bash
npm run lint
npm run build
git status
```

Actualizar la rama si `develop` cambió significativamente.

## 4. Commits

Formato:

```text
tipo(modulo): descripción
```

Tipos recomendados:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`

## 5. Pull Request

El PR debe explicar:

1. Qué problema resuelve.
2. Qué archivos/módulos afecta.
3. Cómo probarlo.
4. Capturas si modifica UI.
5. Riesgos o pendientes.

## 6. No hacer

- Push directo a `main`.
- Force push en ramas compartidas.
- Commits de `.env.local`.
- Modificar contratos compartidos sin coordinar.
- Resolver conflictos borrando código ajeno sin entenderlo.
- Integrar código generado por IA que no pueda explicarse.
