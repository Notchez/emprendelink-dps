# Checklist de entrega — Etapa 3 Foro 1

Fecha de validación técnica: 17 de octubre de 2026.

## Aplicación

- [x] React Native creado en `mobile/` con Expo SDK 57.
- [x] Servidor Expo inicia y muestra QR/URL de Metro.
- [x] App compila: exportación Android de producción completada.
- [x] Login funcional con servicio temporal.
- [x] Registro funcional con roles permitidos.
- [x] Navegación auth stack, selección segura por rol, app stack y bottom tabs.
- [x] CUSTOMER accede al flujo completo; ENTREPRENEUR/ADMIN no entran al flujo de compra.
- [x] Negocios con búsqueda y estados de UI.
- [x] Catálogo con búsqueda y categorías.
- [x] Pedidos con creación temporal, listado, detalle y permanencia después de pull-to-refresh
  durante la ejecución.
- [x] Perfil con datos de usuario y logout.
- [x] Detalle de producto.
- [x] Carrito con cantidades, eliminación, subtotal e invariante `vacío → business === null`.
- [x] Validaciones separadas de la UI.
- [x] Componentes reutilizables y sistema visual.
- [x] Diseño coherente con la web actual de EmprendeLink.
- [x] Loading, error y empty states donde corresponden.
- [x] Áreas seguras, teclado, scroll y accesibilidad básica.
- [x] Mocks fuera de las pantallas y alineados con contratos.

## Documentación y evidencia

- [x] README raíz actualizado.
- [x] `mobile/README.md` creado desde cero.
- [x] Documento técnico APA 7 base en `docs/ETAPA3_FORO1.md`.
- [x] PDF base generado y revisado visualmente en `docs/ETAPA3_FORO1.pdf`.
- [ ] Nombre del docente completado en portada.
- [ ] Capturas reales insertadas en el documento.
- [ ] Contraste visual final contra Figma original con acceso autorizado.
- [x] Guion de video máximo 15 minutos.
- [ ] Video real grabado y revisado (requiere intervención del equipo).
- [ ] PDF final regenerado después de insertar capturas y datos de portada.

## Pruebas

- [x] `mobile/npm test`: 18/18 pruebas aprobadas (validación, carrito, pedidos y roles).
- [x] `mobile/npm run export:android`: bundle generado sin imports rotos.
- [x] `mobile/npx expo-doctor`: 21/21 comprobaciones aprobadas.
- [ ] Prueba visual en emulador o teléfono: requiere dispositivo conectado.
- [x] `npm test` web: 12/12 pruebas aprobadas.
- [x] `npm run check` web: lint y build de producción aprobados.
- [ ] Aplicación sin errores visibles en la grabación final.

## Git y entrega

- [x] Rama `feature/etapa3-react-native-foro1` creada desde `develop` actualizado.
- [x] Commits separados y revisables creados.
- [x] Rama subida a GitHub.
- [ ] Pull Request abierto hacia `develop`.
- [ ] CI `validate` en verde.
- [ ] Repositorio GitHub incluido en la entrega del aula.
- [ ] Participación/commits de integrantes verificados según indicaciones docentes.

## No incluido por alcance de Foro 1

- [ ] Firebase Authentication móvil.
- [ ] Google Sign-In móvil.
- [ ] Firestore móvil.
- [ ] Integración completa web ↔ móvil.

Estos cuatro puntos no se marcan como defectos de esta entrega: están documentados como trabajo de
Foro 2. Antes de enviar, el equipo debe completar exclusivamente las evidencias pendientes que
requieren acceso humano: docente, Figma, capturas, video, PR/CI y revisión visual en dispositivo.
