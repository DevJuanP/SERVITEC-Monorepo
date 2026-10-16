# Cambios para el documento Word — SERVITEC (Grupo 10)

> **Qué es este archivo.** Lista de cambios de redacción a aplicar en la **próxima edición del Word**
> (Entregable 3 / informe final), derivados de la conciliación entre el Word del Entregable N.° 2 y las
> especificaciones técnicas (`docs/specs/01–08`).
>
> **Fuente de verdad técnica:** `docs/specs/`. Este documento es solo la guía de redacción para que el Word
> quede alineado con lo que ya está especificado.
>
> **El Word entregado no se edita retroactivamente**: estos cambios se incorporan en la siguiente versión
> que se presente.

## Decisiones que originan estos cambios

| # | Tema | Decisión tomada |
|---|---|---|
| 1 | Inventario | Control de stock completo: un producto agotado (`stock = 0`) no se ofrece; el administrador lo repone desde el panel. |
| 2 | Métricas SMART | Plan de medición **diferido**: se documentará en la etapa de pruebas (semanas 6–7). |
| 3 | Citas | Agendamiento por **franjas de 1 hora** (lun–vie 09:00–17:00, sin 12:00–13:00; 7 franjas por asesor y día) + ciclo `Pendiente → Aprobada → Realizada` con **observación** al concluir. |
| 4 | Registro | Los **clientes** se registran desde la web; **solo el administrador** da de alta nuevos asesores. |
| 5 | HTTPS | El prototipo local usa **HTTP**; HTTPS es requisito del despliegue productivo (fuera de alcance). |
| 6 | Versiones | Java 21, Spring Boot 4.1.x, PostgreSQL 18, React 19 + Vite 7 (tabla lista para copiar; ver §14). |

---

## 1. §1.1 Diagnóstico — Tabla 1 (situación actual vs. deseada)

**Fila "Catálogo e inventario"** — columna *Situación deseada (con Servitec)*

- Actual: "Catálogo estructurado por categoría y subcategoría"
- **Propuesto:** "Catálogo estructurado por categoría y subcategoría, con control de stock por producto"

**Fila "Control de usuarios"** — columna *Situación deseada (con Servitec)*

- Actual: "Autenticación con roles cliente / asesor / administrador"
- **Propuesto:** "Autenticación con roles cliente / asesor / administrador, con alta de asesores desde la administración"

*Motivo: decisiones 1 y 4.*

## 2. §1.2 Adversidades — Tabla 2

**Fila "Catálogo desactualizado"** — columna *Módulo del proyecto que la atiende*

- Actual: "Gestión de catálogo e inventario vinculado"
- **Propuesto:** "Gestión de catálogo con control de stock y reglas de agotado"

*Motivo: decisión 1.*

## 3. §2.1 Objetivos SMART — OBJ 1, OBJ 2 y OBJ 3

**OBJ 1 (eficiencia) y OBJ 3 (usabilidad y rendimiento):** agregar una nota al pie de ambos objetivos (o al pie de la Tabla 6):

> "El plan de medición (cronometraje del registro de citas, registro de rendimiento con percentil 95 y lista de comprobación de usabilidad) se documentará en la etapa de pruebas, semanas 6–7; las metas permanecen vigentes."

**OBJ 2 (calidad funcional):** la frase "al menos seis casos de prueba" sigue siendo válida, pero conviene precisar:

- Actual: "al menos seis casos de prueba de las funciones prioritarias (autenticación, listado de catálogo, creación, consulta y cancelación de citas, y rechazo de horario ocupado)"
- **Propuesto:** "al menos seis casos de prueba de las funciones prioritarias (autenticación, listado de catálogo, creación, consulta y cancelación de citas, y rechazo de horario ocupado); el plan técnico vigente contempla doce casos (P01–P12)"

*Motivo: decisión 2.*

## 4. §2.2 Alcance — viñeta de identidad

- Actual: "Un módulo completo de gestión de identidad para clientes y asesores, con flujos de autenticación seguros persistidos en PostgreSQL."
- **Propuesto:** "Un módulo de gestión de identidad con registro público de clientes, inicio de sesión para los tres roles (cliente, asesor y administrador) y alta de asesores realizada por el administrador, con flujos de autenticación seguros persistidos en PostgreSQL."

*Motivo: decisión 4 (evita interpretar que un asesor puede autocrearse su cuenta).*

## 5. §2.2 Alcance — viñeta de citas

- Actual: "Un motor interactivo de citas que permite agendar, cancelar y visualizar el estado de asesorías técnicas virtuales o presenciales, con control de solapamiento de horarios."
- **Propuesto:** "Un motor interactivo de citas por franjas horarias de una hora (lunes a viernes, 09:00–17:00, con receso de 12:00 a 13:00; siete franjas por asesor y día) que permite consultar la disponibilidad real del asesor, agendar, aprobar, concluir con observación y cancelar asesorías técnicas virtuales o presenciales, con control de solapamiento de horarios."

*Motivo: decisión 3.*

## 6. §2.2 Alcance — viñeta de catálogo

- Actual: "Un catálogo dinámico de hardware estructurado taxonómicamente por categorías y subcategorías, modelado mediante entidades relacionales normalizadas."
- **Propuesto:** "Un catálogo dinámico de hardware estructurado por categorías y subcategorías, con control de stock por producto de modo que los productos agotados no se ofrezcan al público, modelado mediante entidades relacionales normalizadas."

*Motivo: decisión 1.*

## 7. Tabla 5 (Stack) — fila "Seguridad"

- Actual — Tecnología: "HTTPS y control de acceso por roles"; Criterio: "Alineación con la Ley N.° 29733"
- **Propuesto** — Tecnología: "Control de acceso por roles (JWT); HTTPS previsto para producción"; Criterio: "Alineación con la Ley N.° 29733 (transporte seguro en producción)"

*Motivo: decisión 5 (el prototipo local usa HTTP; no hay contradicción, solo precisión).*

## 8. §2.4.3 Tabla 9 (Ubicación tecnológica) — fila "Seguridad"

- Actual: "Control de accesos y transporte HTTPS previstos; implementación por acreditar"
- **Propuesto:** "Control de acceso por roles (JWT) definido en la especificación; HTTPS se habilita en el despliegue productivo, fuera del alcance del prototipo local."

*Motivo: decisión 5.*

## 9. §3.2.2 Arquitectura lógica — flujos básicos

- Actual: "Los flujos básicos previstos son: (1) un usuario autenticado consulta componentes; (2) un cliente solicita o cancela una cita; (3) un asesor consulta su agenda; y (4) un administrador mantiene el catálogo. Las rutas API y las reglas exactas deberán definirse a partir del repositorio real."
- **Propuesto:** "Los flujos básicos previstos son: (1) un usuario autenticado consulta el catálogo (los productos agotados no se ofrecen); (2) el cliente elige asesor y fecha, consulta las franjas disponibles y agenda una cita, o cancela una propia; (3) el asesor consulta su agenda, aprueba las solicitudes viables y concluye las citas con una observación; y (4) el administrador mantiene el catálogo y su stock, y da de alta nuevos asesores. Las rutas API y las reglas están definidas en el repositorio (`docs/specs/03-api-contract.md`)."

*Motivo: decisiones 1, 3 y 4 + avance del repositorio (ya no es "por definir").*

## 10. §3.2.3 Tabla 16 (Historias de usuario) — agregar HU-08 a HU-11

| ID | Historia de usuario | Criterio de aceptación observable |
|---|---|---|
| HU-08 | Como administrador quiero controlar el stock para no ofrecer productos agotados | Un producto con stock 0 no aparece en el catálogo público y el administrador puede reponerlo |
| HU-09 | Como asesor quiero aprobar las solicitudes de mi agenda para confirmar las citas viables | La cita pendiente pasa a aprobada solo por su asesor (o el administrador); una cita ajena se rechaza |
| HU-10 | Como asesor quiero concluir una cita aprobada registrando una observación | La cita pasa a realizada con la observación persistida; una transición inválida se rechaza |
| HU-11 | Como administrador quiero dar de alta nuevos asesores | El asesor queda activo, inicia sesión y aparece en la lista de asesores; solo el administrador puede crearlo |

*Motivo: decisiones 1, 3 y 4.*

## 11. §3.2.4 Tabla 17 (Plan de pruebas) — agregar P08 a P12

| Código | Escenario | Resultado esperado | Evidencia |
|---|---|---|---|
| P08 | Producto agotado no se ofrece | Stock 0 excluido del catálogo público y visible para el administrador | Captura / log por adjuntar |
| P09 | Consultar citas | El cliente ve sus citas; el asesor y el administrador ven la agenda ordenada | Captura / log por adjuntar |
| P10 | Consultar disponibilidad | Siete franjas del día con las ocupadas marcadas | Captura / log por adjuntar |
| P11 | Ciclo de estados de la cita | `Pendiente → Aprobada → Realizada` con observación persistida; transición inválida rechazada | Captura / log por adjuntar |
| P12 | Alta de asesor por el administrador | Asesor creado y visible en la lista; sin permisos se rechaza | Captura / log por adjuntar |

*Motivo: decisiones 1, 3 y 4.*

## 12. §3.2.5 Tabla 18 (Recursos) — actualizar estados

| Recurso | Estado actual en el Word | Propuesto |
|---|---|---|
| Guía de instalación | "Pendiente de datos del repositorio" | "Redactada en `docs/specs/07-install-guide.md` (versiones, variables de entorno, puertos); pendiente de implementación del backend" |
| Manual técnico de operación | "Pendiente" | "Redactado en `docs/specs/08-ops-manual.md` (respaldo, logs, mantenimiento, errores)" |
| Repositorio y dependencias | "Pendiente de confirmación" | "Repositorio: `github.com/DevJuanP/SERVITEC-Monorepo` (apps/front, apps/api, db/migrations)" |

*Motivo: el repositorio y los documentos ya existen.*

## 13. Tabla de versiones (nueva) — copiar tal cual donde se declaren versiones

| Componente | Versión |
|---|---|
| Java (JDK) | **21 (LTS)** |
| Spring Boot | **4.1.x** |
| Spring Framework / Security | 7.x (Resource Server, JWT HS256) |
| PostgreSQL | **18** |
| Flyway | gestionado por Spring Boot |
| Maven | wrapper `mvnw` |
| Node.js / npm | 20+ (recomendado 24) / 10+ |
| React / Vite | 19 / 7 |
| Git | cualquiera reciente |

> Nota para el informe: el equipo trabaja hoy con JDK 17 y debe migrar a **21** (requisito del backend).

*Motivo: decisión 6 (cierra el "pendiente de versiones" de la Tabla 18).*

## 14. §3.2.6 Tabla 19 (Trazabilidad) — ajustes

| Fila | Actual | Propuesto |
|---|---|---|
| Identidad de usuarios | "HU-01, P01, P02, captura y log" | "HU-01, HU-11; P01, P02, P12; captura y log" |
| Catálogo | "HU-02, HU-06, P06, capturas" | "HU-02, HU-06, HU-08; P06, P08; capturas" |
| Agenda | "HU-03, HU-04, HU-05, P03-P05" | "HU-03, HU-04, HU-05, HU-09, HU-10; P03–P05, P11" |
| Disponibilidad | "HU-07, P04 y prueba de concurrencia" | "HU-07 y reglas de franja; P04, P10" |

*Motivo: decisiones 1, 3 y 4.*

## 15. §3.2.7 Tabla 20 (Riesgos) — fila "Solapamiento de citas"

- Actual — Mitigación: "Restricciones y pruebas de concurrencia (backend/pruebas)"
- **Propuesto:** "Restricciones por franja (índice único asesor + franja horaria) y validación de disponibilidad; pruebas P04 y P10 (backend/pruebas)"

*Motivo: decisión 3.*

---

## Checklist final antes de entregar el Word actualizado

- [ ] Tabla 1 y Tabla 2 ajustadas (ítems 1 y 2)
- [ ] OBJ 1–3 con la nota de medición (ítem 3)
- [ ] Alcance §2.2: identidad, citas y catálogo reescritos (ítems 4, 5 y 6)
- [ ] Tabla 5 y Tabla 9 con la precisión de HTTPS (ítems 7 y 8)
- [ ] §3.2.2 con los flujos actualizados (ítem 9)
- [ ] Tabla 16 con HU-08 a HU-11 (ítem 10)
- [ ] Tabla 17 con P08 a P12 (ítem 11)
- [ ] Tabla 18 con estados actualizados + tabla de versiones (ítems 12 y 13)
- [ ] Tabla 19 con la trazabilidad ampliada (ítem 14)
- [ ] Tabla 20 con la mitigación de solapamiento por franjas (ítem 15)

## Referencias

- Especificación funcional, reglas y pruebas: `docs/specs/01-functional.md`
- Modelo de datos (stock, estados, observación): `docs/specs/02-data-model.md`
- Contrato de API (endpoints nuevos): `docs/specs/03-api-contract.md`
- Versiones del stack: `docs/specs/07-install-guide.md`
- Registro de la decisión de diferir las métricas: `docs/specs/01-functional.md` (nota "Diferido")
