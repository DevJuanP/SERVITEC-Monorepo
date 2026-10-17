# 00 — Contrato de planes de ejecución

Reglas que gobiernan **cómo se generan y cómo se ejecutan** los planes de `docs/plans/`. Los planes construyen la app definida en [`docs/specs/`](../specs/README.md) (01–10). Jerarquía: las especificaciones mandan sobre este contrato; este contrato manda sobre los planes.

---

## 1. Propósito y jerarquía documental

| Carpeta | Rol |
|---|---|
| `docs/specs/` | **Qué** se construye, **por qué** y **cómo debe verse/comportarse** (01–10). Fuente de verdad. |
| `docs/plans/` | **Cómo** se construye: orden, tareas, verificación y estado. |

Un plan de ejecución:

- deriva de las especificaciones y las **cita** (no las duplica ni las reinterpreta);
- descompone el trabajo en tareas **verificables** y de tamaño manejable;
- declara **orden, dependencias y precondiciones**;
- registra su **estado** y sus **desvíos**.

Un plan **no**: agrega requisitos, redecide diseño ni sustituye a las especificaciones.

---

## 2. Principios de planificación (reglas duras)

1. **Trazabilidad total.** Toda tarea cita al menos un ID de `01`–`10` (HU-xx, R-xx, Pxx, C-xx, Bxx, Axx) o una sección de `02`–`10`. Cada plan incluye su matriz; `README.md` mantiene la matriz global. Objetivo: cobertura 100 % de requisitos activos (lo diferido a fase 2 se marca como tal).
2. **Sin requisitos nuevos.** Si algo no está definido, se registra como pregunta en el «Registro de desvíos y decisiones» del plan y se detiene solo esa tarea. Los cambios funcionales se aprueban primero en las especificaciones (§9).
3. **Verificación ejecutada.** Ninguna tarea está «hecha» sin su verificación corrida (comando o checklist con pasos reproducibles). «Debería funcionar» no cuenta.
4. **Autocontenida.** Un ejecutor debe poder completar una tarea leyendo el plan + las secciones citadas, sin releer todo el paquete.
5. **Tarea = cambio coherente y verificable.** Regla práctica: 1 tarea ≈ 1 commit. Si una tarea abarca demasiado, se divide.
6. **Orden y dependencias explícitos.** Cada plan declara de qué planes depende; se ejecutan 01→10 salvo independencia declarada (ver `README.md`).
7. **No duplicar.** Los planes citan (`03 §C-5`, `02 §tabla notificaciones`), no copian; la única excepción son valores imprescindibles en el momento (p. ej. defaults 5 / 0 / −2).
8. **Estados honestos.** ✅ solo con verificación hecha; ⏸ siempre con causa registrada.

---

## 3. Nomenclatura y estados

| Elemento | Regla | Ejemplo |
|---|---|---|
| Plan | `NN-slug.md`, NN = orden de ejecución | `01-guia-de-ejecucion.md` |
| Tarea | `T-N.M` (única en todo el proyecto) | `T-6.4` |
| Subtarea | `T-N.M.k` — evitar; preferir dividir la tarea | `T-6.4.2` |
| Cita de spec | `doc §sección` | `01 §HU-05`, `03 §C-5`, `06 §B16`, `09 §Alcance` |

**Estados** (tareas y planes): **⬜ Pendiente · 🔄 En curso · ✅ Hecho · ⏸ Bloqueado** (⏸ siempre con causa en el registro del plan).

---

## 4. Plantilla obligatoria de plan

Todo plan usa exactamente estas secciones, en este orden:

```md
# Plan NN — {Título}
> Estado: ⬜ Pendiente · Depende de: {planes o "—"} · Cubre: {IDs/§} · Estimación: {S|M|L}

## 1. Objetivo
{2–3 líneas: qué queda funcionando al terminar}

## 2. Alcance
- **Incluye:** …
- **No incluye:** … (con el plan al que pertenece lo excluido)

## 3. Referencias
- Specs: …
- Skills: … (las que se aplican en este plan)

## 4. Precondiciones
- {estado verificable del repo, comandos que deben pasar, decisiones pendientes a resolver}

## 5. Tareas
### T-N.1 — {Título}
- **Objetivo:** …
- **Archivos:** {crear/modificar}
- **Pasos:** …
- **Criterios de aceptación:** {IDs}
- **Verificación:** {niveles V0–V4 + comando o checklist}
- **Estado:** [ ]

## 6. Matriz de trazabilidad del plan
| ID / sección | Tarea(s) |

## 7. Verificación final del plan
- [ ] {checks que solo se pueden correr con el plan completo}

## 8. Registro de desvíos y decisiones
{append-only; inicia vacío — se completa durante la ejecución}
```

**Estimación:** S / M / L (relativa; orientativa, no un compromiso de tiempo).

---

## 5. Verificación por tipo de tarea

| Nivel | Qué es | Cuándo es obligatorio |
|---|---|---|
| **V0 — Estático** | `npm run build` (front) y `mvn compile` / `mvn test` (backend) en verde | **Toda** tarea de código |
| **V1 — Unitario** | Pruebas de lógica pura (JUnit backend / Vitest front) | Dominio y datos: validaciones, parser, formato, cálculos de franja/disponibilidad |
| **V2 — Manual guiado** | Checklist con pasos exactos (qué tocar y qué debe verse); base: `07-install-guide.md` + la sección de pantalla (`09-admin-panel.md` / `10-front-publico-citas.md`) | Tareas de UI/pantalla |
| **V3 — Auditoría de contrato** | Revisión de `03-api-contract.md` sobre los archivos de la tarea/pantalla | UI o API terminada |
| **V4 — Rendimiento y release** | Smoke test en la URL desplegada + build en verde | Solo release |

Reglas:

- Las pruebas automatizadas cubren **lógica pura**; no se añaden frameworks de test de componentes innecesarios.
- La verificación V2 se escribe con pasos reproducibles, no con «revisar que se vea bien».
- Si una verificación falla: la tarea vuelve a 🔄, se corrige y (si cambió el enfoque) se registra en el registro del plan.
- Los planes de UI **pueden** usar la galería de desarrollo del front público como superficie de V2.

---

## 6. Definición de Hecho (DoD)

**Tarea** — todo:

- [ ] Implementación completa según su alcance;
- [ ] Verificación(es) del nivel declarado, ejecutada(s) y en verde;
- [ ] Estado `[x]` actualizado en el plan;
- [ ] Commit creado (§8).

**Plan** — todo:

- [ ] Todas las tareas ✅;
- [ ] Verificación final del plan ✅;
- [ ] Fila del plan en `README.md` en ✅ + entrada en el changelog.

**Proyecto (v1)** — todo:

- [ ] Los planes de `docs/plans/` ✅ (roadmap, backend, front-publico, admin, matriz, guía de ejecución);
- [ ] Cobertura 100 % de la matriz global;
- [ ] HU-01…HU-12, R-1…R-15 y P01–P13 verificados de punta a punta;
- [ ] Criterios de éxito de `01-functional.md` cumplidos;
- [ ] Publicación: **deploy manual del usuario** con la app construida, verificada y el runbook preparado (`08-ops-manual.md`).

---

## 7. Proceso de generación de un plan

1. **Leer** este contrato + las secciones de la especificación implicadas (completas, no fragmentos).
2. **Descomponer** en tareas candidatas: cada una verificable, trazable y de tamaño «1 commit».
3. **Ordenar** por dependencias internas y declarar precondiciones.
4. **Construir la matriz** del plan (IDs → tareas).
5. **Redactar** con la plantilla de §4.
6. **Autoauditar** (checklist de abajo) y corregir.
7. **Entregar como propuesto.** Revisión del usuario → «aprobado» (se refleja en `README.md`).

**Autoauditoría obligatoria:**

- [ ] ¿Toda tarea cita ≥1 ID o sección?
- [ ] ¿Todo ID de «Cubre» aparece en la matriz con ≥1 tarea?
- [ ] ¿Toda tarea tiene verificación ejecutable (comando o checklist)?
- [ ] ¿Cero requisitos nuevos (lo no definido quedó como pregunta en el registro)?
- [ ] ¿Precondiciones concretas y dependencias correctas?
- [ ] ¿Rutas y nombres consistentes con `06-front-adaptation.md`?

**Revisión de vigencia (antes de ejecutar cada plan):** releer el plan contra las especificaciones; si algo cambió (o se resolvió una decisión pendiente de `08-ops-manual.md`), actualizar el plan primero (§9) y anotarlo en el changelog.

**Plantilla de encargo** (para pedir a cualquier agente la generación o actualización de un plan):

> Genera/actualiza `docs/plans/NN-slug.md` siguiendo `docs/plans/00-contrato.md`. Lee: {secciones de especificación implicadas} y los planes de los que depende. Salida: plan completo con la plantilla de §4 y la autoauditoría en verde. No inventes requisitos; registra ambigüedades como preguntas en el registro de desvíos.

---

## 8. Protocolo de ejecución

**Antes de un plan:** revisión de vigencia (§7); confirmar que sus planes de dependencia están ✅.

**Ciclo por tarea:**

1. Leer la tarea + secciones citadas.
2. Implementar.
3. Correr la verificación declarada (y la V0 aunque no esté listada).
4. Actualizar el estado `[x]` en el plan.
5. Commit.

**Commits:** Conventional Commits en español, un alcance por commit, 1 tarea ≈ 1 commit. Ejemplos: `feat(api): endpoint disponibilidadSemana`, `test(cita): franja ocupada devuelve 409`, `docs(plans): cierra el plan 01`. **Nunca** commitear con V0 en rojo.

**Bloqueo (⏸):** registrar causa + pregunta en el «Registro de desvíos y decisiones» del plan; continuar las tareas no dependientes si las hay; si el bloqueo es total, cerrar el turno con el resumen del bloqueo.

**Cierre de plan:** correr la verificación final; actualizar `README.md` (estado ✅ + changelog); commit `docs(plans): cierra el plan NN`.

**Regla de secuencia:** no se inicia un plan con dependencias sin ✅ (salvo independencia declarada en `README.md`).

---

## 9. Control de cambios

- Las especificaciones están **congeladas** durante la ejecución.
- **Cambio funcional o de diseño:**
  1. detener las tareas afectadas;
  2. actualizar la especificación correspondiente (describiendo el antes/después en el propio doc);
  3. actualizar los planes afectados (tareas, matrices);
  4. registrar el desvío en el plan y una entrada en el changelog de `README.md`;
  5. reanudar.
- **Correcciones editoriales** sin cambio de comportamiento (tildes, enlaces, erratas): directas, con entrada en el changelog.
- **Este contrato** se enmienda con el mismo flujo (es una especificación más).

---

## 10. Restricciones permanentes heredadas

| Área | Restricción | Fuente |
|---|---|---|
| Dependencias | Solo las del stack: React 19, Vite 7, react-router-dom 7, axios, react-toastify (front); Spring Boot 4.1.x, Java 21, Spring Security 7 (JWT HS256), PostgreSQL 18, Flyway (backend). Cualquier otra requiere aprobación explícita | `04`, `07` |
| Diseño | Sin kickers, sin gradientes decorativos, una sola elevación por elemento, sentence case, sin emojis como iconos, tema claro | front existente |
| Contenido | Documentación en español; interfaz es-PE; identificadores de código en inglés | `01 §RNF-07` |
| Navegadores | Evergreen (Safari 16.4+ / Chrome 111+); móvil primero | `06 §6.3` |
| Alcance | Solo lo definido en `01-functional.md` y `02-data-model.md`; lo diferido (PWA, revisión con explicaciones, historial extendido) está fuera de v1 | `01 §1.5` |
