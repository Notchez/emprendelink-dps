# Firebase — preparación

Firebase se incluye desde el esqueleto porque forma parte de la arquitectura objetivo del proyecto
y permite mantener una ruta de migración limpia hacia la etapa móvil.

## Variables

Copiar:

```text
.env.example → .env.local
```

Completar únicamente con los valores del proyecto Firebase aprobado por el equipo.

## Reglas

- No subir `.env.local`.
- No poner credenciales privadas en el cliente.
- No importar Firebase directamente desde componentes visuales.
- Centralizar configuración en `src/lib/firebase`.
- Centralizar operaciones de datos en `src/services`.
- Las reglas de Firestore deberán salir de modo test antes de la etapa que lo exige.
