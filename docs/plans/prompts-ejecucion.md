# Prompts de ejecución — SERVITEC

Prompts listos para pegar, uno por **sesión nueva** de agente. Traducen el protocolo de
[`00-contrato.md`](./00-contrato.md) (§8) y el orden de [`01-guia-de-ejecucion.md`](./01-guia-de-ejecucion.md)
en encargos autónomos.

## Cómo se usan

1. **Una sesión por fase.** Respeta la secuencia `F1 → F2 → F3`; no abras F2 si F1 no está ✅, ni F3 sin F2 ✅.
2. **Pepea primero el Prompt 4 (Traspaso)** para reconstruir el estado real del repo, y **luego** el prompt de la fase que corresponda.
3. **El estado vive en el repo**, no en la memoria del agente: `git` (commits) + checkboxes de los planes + `README.md`. El agente nuevo debe leerlos, no recordar.
4. **No resumas las specs**: pásale los archivos (los prompts ya listan las rutas).
5. **Cierre de cada fase**: verificación en verde + estado `[x]` + commit `docs(plans): cierra FN` antes de pasar a la siguiente.

## Estado

- [x] Prompt 1 — F1 Backend (`apps/api`) — *ejecutado*
- [ ] Prompt 2 — F2 Front público (`apps/front`)
- [ ] Prompt 3 — F3 Panel admin (`apps/admin`)
- [ ] Prompt 4 — Traspaso / diagnóstico (uso previo a cada sesión)

---

## Prompt 1 — Fase F1 · Backend (`apps/api`)

```
Rol: ejecutor de planes de docs/plans/ en el monorepo SERVITEC (win32, bash).

Contexto: sesión nueva sin memoria previa. El estado vive en el repo (git + checkboxes de
los planes + README). Ejecuta SOLO la fase F1 Backend. No avances a los fronts.

Lee primero, completos:
- docs/plans/00-contrato.md   (protocolo §8, DoD §6, control de cambios §9)
- docs/plans/00-roadmap.md
- docs/plans/01-guia-de-ejecucion.md
- docs/plans/plan-backend.md   (fases B1→B6)
- docs/specs/03-api-contract.md   (fuente de verdad del contrato)
- docs/specs/04-backend-conventions.md
- docs/specs/02-data-model.md
- docs/specs/05-db-migrations.md  (solo para validar F0)
- docs/plans/matriz-trazabilidad.md  (P01–P13)

Precondiciones (verifica antes de empezar):
- F0 hecha: db/migrations tiene V1–V4 + semilla R__01–R__04.
- JDK 21 en JAVA_HOME (el equipo tiene 17 → apúntalo).
- PostgreSQL 18 arriba con BD servitec (y servitec_test para pruebas).

Tareas: ejecuta B1→B6 en orden. Antes de ejecutar, normaliza plan-backend.md a la
plantilla obligatoria de §4 (IDs T-N.M, matriz del plan, registro de desvíos) y corre la
autoauditoría de §7; si eso genera cambios, anótalos.

Reglas:
- Cita specs, NO inventes requisitos. Si algo no está definido: registra la pregunta en el
  «Registro de desvíos y decisiones» del plan y detén solo esa tarea.
- Ciclo por tarea (§8): implementar → correr verificación (V0 mvn test/compile; V1 JUnit en
  dominio) → marcar [x] → commit Conventional Commits en español, 1 tarea ≈ 1 commit.
- Nunca commitear con V0 en rojo.

Entregable / DoD:
- API completa respetando C-1...C-11 y mensajes exactos de 03.
- ./mvnw test (Windows: mvnw.cmd test) EN VERDE con P01–P13.
- CORS operativo para :5173 y :5174.
- Al cerrar: verificación final del plan + actualizar README (estado ✅ + changelog) +
  commit docs(plans): cierra F1.

Salida esperada de tu turno: resumen de tareas ✅, salida de mvn test, y confirmación de que
F1 queda lista para habilitar F2.
```

---

## Prompt 2 — Fase F2 · Front público (`apps/front`)

```
Rol: ejecutor de planes de docs/plans/ en el monorepo SERVITEC (win32, bash).

Contexto: sesión nueva sin memoria previa. El estado vive en el repo (git + checkboxes +
README). Ejecuta SOLO la fase F2 Front público. NO toques apps/admin.

Precondición dura: F1 Backend debe estar ✅ (mvn test verde). Verifícalo en README/plan-backend
antes de empezar; si no lo está, detente y repórtalo.

Lee primero, completos:
- docs/plans/00-contrato.md
- docs/plans/00-roadmap.md + docs/plans/01-guia-de-ejecucion.md
- docs/plans/plan-front-publico.md   (fases F1→F3)
- docs/specs/10-front-publico-citas.md   (B16: citas por franjas)
- docs/specs/06-front-adaptation.md      (adaptación base y deuda)
- docs/specs/03-api-contract.md          (endpoints que consumes)

Tareas (en orden):
1. Citas por franjas (B16): FormularioCitas (asesor/tipo reales), CalendarioSemanal
   (disponibilidadSemana), FranjaPicker (disponibilidad), contacto R-15, envío a
   POST /api/cita/agregarCita en ISO UTC (Lima), toasts 400/409, MisCitas + cancelar,
   Notificaciones.
2. Retirar el panel público: borrar ruta /admin y CitaAdmin.jsx; quitar imports/menú;
   Header enlaza panel con VITE_ADMIN_URL (nuevo .env.example).
3. Verificación.

Reglas:
- Cita specs, NO inventes requisitos; ambigüedad → registro de desvíos del plan.
- Secuencia Lima (UTC-5) → ISO UTC correcta; nada de localhost hardcodeado (solo VITE_*).
- Ciclo §8 por tarea + commits Conventional en español.

Entregable / DoD:
- Reserva siempre en franja válida (sin 400 por formato/franja); 409 manejado.
- /admin inexistente; enlace al panel solo para admin/asesor.
- npm run build sin errores.
- Al cerrar: verificación final + README ✅ + commit docs(plans): cierra F2.

Salida esperada de tu turno: resumen de tareas ✅, resultado de npm run build, y confirmación
de que F2 queda lista para habilitar F3.
```

---

## Prompt 3 — Fase F3 · Panel admin (`apps/admin`)

```
Rol: ejecutor de planes de docs/plans/ en el monorepo SERVITEC (win32, bash).

Contexto: sesión nueva sin memoria previa. El estado vive en el repo. Ejecuta SOLO la fase F3
Panel admin (apps/admin).

Precondiciones duras: F1 ✅ (API con mvn test verde) y F2 ✅ (front público sin /admin).
Verifícalo antes de empezar.

Lee primero, completos:
- docs/plans/00-contrato.md
- docs/plans/00-roadmap.md + docs/plans/01-guia-de-ejecucion.md
- docs/plans/plan-admin.md          (fases A1→A6)
- docs/specs/09-admin-panel.md      (criterios de aceptación)
- docs/specs/03-api-contract.md     (contrato ya probado)
- docs/specs/07-install-guide.md    (credenciales)

Tareas (en orden A1→A6):
1. A1 Andamiaje Vite/React 19 en :5174, api.js (axios + Bearer + 401→logout), AuthContext
   (valida con GET /api/user/myInfo), ProtectedRoute/RoleRoute, AdminLayout + ruteo.
2. A2 Login (solo admin/asesor; cliente rechazado) + Dashboard (conteos catálogo/stock solo
   admin; asesor ve su agenda).
3. A3 Catálogo e inventario contra GET /api/productos/admin + CRUD con stock.
4. A4 Citas: agenda con filtros + NuevaCita (agregarCitaAdmin) + aprobar/completar/cancelar.
5. A5 Usuarios: GET /api/user, clientesPorCorreo, alta de asesores.
6. A6 Verificación.

Reglas:
- Reutiliza el contrato de 03; NO inventes endpoints ni requisitos. Ambigüedad → registro.
- apps/admin es autónomo (sin workspaces), VITE_API_URL.
- Ciclo §8 + commits Conventional en español.

Entregable / DoD:
- Criterios de aceptación de 09-admin-panel.md cumplidos.
- npm run dev en :5174 y npm run build sin errores; CORS :5174 operativo.
- asesor NO ve Catálogo/Usuarios; admin ve todo.
- Al cerrar: verificación final + README ✅ + commit docs(plans): cierra F3.

Salida esperada de tu turno: resumen de tareas ✅, resultado de npm run build, y estado final
de la matriz de trazabilidad global.
```

---

## Prompt 4 — Traspaso / diagnóstico (uso previo a cada sesión)

```
Rol: revisor de estado en el monorepo SERVITEC (win32, bash). Sesión nueva, sin memoria.

Objetivo: reconstruir el estado REAL del repo y decidir desde dónde continuar. NO edites
nada todavía; primero reporta. Trabaja en modo solo-lectura.

Fuentes de verdad (léelas completas):
- README.md                      (estado de planes + changelog)
- docs/plans/*.md               (checkboxes [x] por tarea)
- docs/plans/00-contrato.md     (§3 estados, §8 protocolo, §6 DoD)
- docs/plans/01-guia-de-ejecucion.md + 00-roadmap.md (secuencia F0→F3)
- docs/plans/matriz-trazabilidad.md

Inspección del repo (solo lectura):
- git status ; git log --oneline -20
- git diff y git diff --staged (¿hay trabajo sin commitear? ¿commit con V0 rojo?)

Comprobación ejecutable del estado (solo si el código ya existe):
- Backend: apps/api presente → ./mvnw test (mvnw.cmd en Windows). Reporta verde/rojo y
  qué P01–P13 pasan.
- Front público: apps/front → npm run build.
- Admin: apps/admin presente → npm run dev en :5174 / npm run build.

Reporta (sin modificar archivos):
1. Fase en curso y su plan; tareas ✅ vs ⬜/🔄/⏸ (con causa si hay bloqueo registrado).
2. Dependencias: ¿F1 ✅ antes de F2? ¿F2 ✅ antes de F3? (regla de secuencia §8).
3. Deriva detectada: cambios sin commitear, planes no normalizados a la plantilla §4,
   matriz global incompleta, README desalineado.
4. Próxima tarea concreta a ejecutar y su prompt de fase (F1/F2/F3) correspondiente.
5. Diferencias entre lo que dice el README y lo que muestra el repo.

Salida: informe corto + recomendación de por dónde (re)arrancar. No hagas cambios ni
commits; espera instrucciones.
```

---

**Orden de uso por sesión:** pega primero el **Prompt 4** (diagnóstico), luego el prompt de la fase que corresponda (F1, F2 o F3).
