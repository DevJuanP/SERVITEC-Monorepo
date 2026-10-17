# Plan — Front público (`apps/front`)

Cierra la deuda B16 (spec `10-front-publico-citas.md`), retira el panel del front público y enlaza
`apps/admin`. La adaptación base (`api.js`, env, contrato) ya está hecha (`06-front-adaptation.md`).

## Fase F1 — Citas por franjas (B16)
- [ ] `FormularioCitas.jsx`: selects de **asesor** (`GET /api/user/asesores`) y **tipo** (`GET /api/cita/tipoCita`) con datos reales.
- [ ] `CalendarioSemanal.jsx`: días y cupos con `GET /api/cita/disponibilidadSemana`.
- [ ] `FranjaPicker.jsx`: al cambiar asesor/fecha, consumir `GET /api/cita/disponibilidad`; pintar franjas libres/ocupadas.
- [ ] Datos de contacto precargados y editables; enviarlos en `contacto` (R-15).
- [ ] Convertir `(fecha, hora)` Lima → ISO UTC y enviar `POST /api/cita/agregarCita`.
- [ ] Toasts: `400` "franja inválida", `409` "horario ocupado" (refrescar franjas).
- [ ] `MisCitas.jsx`: listar `usuario.citas` (formato Lima, `estado` canónico) y cancelar con `POST /api/cita/cancelarCita`.
- [ ] `Notificaciones.jsx`: campana con `GET /api/notificaciones` y marcar leídas.

## Fase F2 — Retirar el panel del público
- [ ] Eliminar la ruta `/admin` y el archivo `apps/front/src/pages/citaAdmin/CitaAdmin.jsx`.
- [ ] Quitar imports/entradas de menú asociadas.
- [ ] `Header.jsx`: para `admin`/`asesor`, enlazar el panel con `VITE_ADMIN_URL` (nuevo `.env.example`).
- [ ] Confirmar que el front público ya no consume endpoints de admin (`GET /api/cita`, `/api/user`, `/api/productos/admin`, CRUD).

## Fase F3 — Verificación
- [ ] `npm run build` sin errores; sin URLs `localhost` hardcodeadas (`grep "localhost:3000" src/` vacío).
- [ ] Flujo completo: login cliente → agendar en franja → ver en "mis citas" → cancelar.

## DoD front público
- Reserva siempre en franja válida (sin `400` por formato/franja).
- `/admin` inexistente; el enlace al panel aparece solo para `admin`/`asesor`.
- `06-front-adaptation.md` criterios de aceptación cumplidos.

## Evidencia
- Capturas del formulario (franjas libres/ocupadas) y del `409` manejado.
- Diff de archivos retirados (`CitaAdmin.jsx`, ruta `/admin`).
