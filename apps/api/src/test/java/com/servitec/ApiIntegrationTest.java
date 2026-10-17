package com.servitec;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.servitec.model.Cita;
import com.servitec.model.Usuario;
import com.servitec.repository.CitaRepository;
import com.servitec.repository.NotificacionRepository;
import com.servitec.repository.ProductoRepository;
import com.servitec.repository.UsuarioRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApiIntegrationTest {

    private static final String PASSWORD = "Servitec123";
    private static final String FRANJA_ISO = "2027-01-04T14:00:00Z";
    private static final String FECHA = "2027-01-04";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private CitaRepository citas;

    @Autowired
    private ProductoRepository productos;

    @Autowired
    private NotificacionRepository notificaciones;

    @Test
    void p01LoginValido() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(loginBody("cliente@servitec.pe")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Login exitoso"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.rol").value("cliente"));
    }

    @Test
    void p02AccesoNoAutorizado() throws Exception {
        mvc.perform(get("/api/user"))
                .andExpect(status().isUnauthorized());

        String token = login("cliente@servitec.pe");
        mvc.perform(get("/api/user").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void p03CrearCitaDisponible() throws Exception {
        String token = login("cliente@servitec.pe");
        Long asesorId = id("asesor@servitec.pe");

        MvcResult result = mvc.perform(post("/api/cita/agregarCita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(citaBody(asesorId, 1L, FRANJA_ISO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensaje").value("Cita registrada con éxito"))
                .andExpect(jsonPath("$.cita.estado").value("Pendiente"))
                .andReturn();

        long citaId = read(result).get("cita").get("_id").asLong();
        assertThat(citas.findById(citaId)).isPresent();
    }

    @Test
    void p04ConflictoDeHorario() throws Exception {
        String token = login("cliente@servitec.pe");
        Long asesorId = id("asesor@servitec.pe");

        mvc.perform(post("/api/cita/agregarCita")
                .header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON)
                .content(citaBody(asesorId, 1L, FRANJA_ISO))).andExpect(status().isCreated());

        mvc.perform(post("/api/cita/agregarCita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(citaBody(asesorId, 1L, FRANJA_ISO)))
                .andExpect(status().isConflict());
    }

    @Test
    void p05CancelarCita() throws Exception {
        String token = login("cliente@servitec.pe");
        long citaId = crearCita(token, id("asesor@servitec.pe"));

        mvc.perform(post("/api/cita/cancelarCita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Cita cancelada"));

        Cita cita = citas.findById(citaId).orElseThrow();
        assertThat(cita.getEstado()).isEqualTo("Cancelada");
    }

    @Test
    void p06CatalogoPorCategoria() throws Exception {
        MvcResult result = mvc.perform(get("/api/productos").param("categoria", "laptops"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode array = read(result);
        assertThat(array.isArray()).isTrue();
        assertThat(array.size()).isEqualTo(productos.findPublico("laptops", null).size());
        for (JsonNode producto : array) {
            assertThat(producto.get("categoria").get("name").asText()).isEqualTo("laptops");
            assertThat(producto.get("stock").asInt()).isGreaterThan(0);
        }
    }

    @Test
    void p08ControlDeStock() throws Exception {
        var agotados = productos.findAdmin(null, null).stream().filter(p -> p.getStock() == 0).toList();
        assertThat(agotados).isNotEmpty();

        JsonNode publicos = read(mvc.perform(get("/api/productos")).andReturn());
        String adminToken = login("admin@servitec.pe");
        JsonNode admin = read(mvc.perform(get("/api/productos/admin")
                .header("Authorization", "Bearer " + adminToken)).andReturn());

        for (var agotado : agotados) {
            assertThat(containsProducto(publicos, agotado.getId())).isFalse();
            assertThat(containsProducto(admin, agotado.getId())).isTrue();
        }

        String body = "{\"name\":\"Producto malo\",\"price\":10.00,\"stock\":-1,"
                + "\"description\":[],\"img\":null,\"categoria\":{\"name\":\"laptops\",\"Subcategoria\":\"gaming\"}}";
        mvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void p09ConsultarCitas() throws Exception {
        Long clienteId = id("cliente@servitec.pe");
        String clienteToken = login("cliente@servitec.pe");
        JsonNode misCitas = read(mvc.perform(get("/api/user/myInfo")
                .header("Authorization", "Bearer " + clienteToken)).andReturn())
                .get("usuario").get("citas");
        assertThat(misCitas.size()).isEqualTo(citas.findByClienteIdOrderByFechaCitaAsc(clienteId).size());
        assertSortedAsc(misCitas);

        Long asesorId = id("asesor@servitec.pe");
        String asesorToken = login("asesor@servitec.pe");
        JsonNode agenda = read(mvc.perform(get("/api/cita")
                .header("Authorization", "Bearer " + asesorToken)).andReturn()).get("citas");
        assertThat(agenda.size()).isEqualTo(citas.findByAsesorIdOrderByFechaCitaAsc(asesorId).size());
        assertSortedAsc(agenda);
    }

    @Test
    void p10ConsultarDisponibilidad() throws Exception {
        String token = login("cliente@servitec.pe");
        Long asesorId = id("asesor@servitec.pe");

        mvc.perform(get("/api/cita/disponibilidad")
                        .header("Authorization", "Bearer " + token)
                        .param("asesorId", asesorId.toString())
                        .param("fecha", FECHA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.franjas.length()").value(7));

        mvc.perform(get("/api/cita/disponibilidad")
                        .header("Authorization", "Bearer " + token)
                        .param("asesorId", asesorId.toString())
                        .param("fecha", "2027/01/04"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void p11CicloDeEstados() throws Exception {
        String clienteToken = login("cliente@servitec.pe");
        long citaId = crearCita(clienteToken, id("asesor@servitec.pe"));
        String asesorToken = login("asesor@servitec.pe");

        mvc.perform(post("/api/cita/aprobarCita")
                        .header("Authorization", "Bearer " + asesorToken)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Cita aprobada"));

        mvc.perform(post("/api/cita/completarCita")
                        .header("Authorization", "Bearer " + asesorToken)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + ",\"observacion\":\"Equipo reparado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Cita concluida"));

        Cita cita = citas.findById(citaId).orElseThrow();
        assertThat(cita.getEstado()).isEqualTo("Realizada");
        assertThat(cita.getObservacion()).isEqualTo("Equipo reparado");

        mvc.perform(post("/api/cita/aprobarCita")
                        .header("Authorization", "Bearer " + asesorToken)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void p12AltaDeAsesores() throws Exception {
        String adminToken = login("admin@servitec.pe");
        String correo = "nuevo.asesor@servitec.pe";
        String body = "{\"nombre\":\"Nuevo Asesor\",\"correo\":\"" + correo + "\",\"password\":\"secreto123\"}";

        MvcResult result = mvc.perform(post("/api/user/asesores")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.rol").value("asesor"))
                .andReturn();
        long nuevoId = read(result).get("usuario").get("_id").asLong();

        JsonNode asesores = read(mvc.perform(get("/api/user/asesores")
                .header("Authorization", "Bearer " + adminToken)).andReturn()).get("asesores");
        assertThat(containsId(asesores, nuevoId)).isTrue();

        String clienteToken = login("cliente@servitec.pe");
        mvc.perform(post("/api/user/asesores")
                        .header("Authorization", "Bearer " + clienteToken)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/user/asesores")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void p13CancelarPorAsesorYNotificacion() throws Exception {
        String clienteToken = login("cliente@servitec.pe");
        Long clienteId = id("cliente@servitec.pe");
        long citaId = crearCita(clienteToken, id("asesor@servitec.pe"));

        String otroAsesor = login("asesor2@servitec.pe");
        mvc.perform(post("/api/cita/cancelarCita")
                        .header("Authorization", "Bearer " + otroAsesor)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isForbidden());

        String asesorToken = login("asesor@servitec.pe");
        mvc.perform(post("/api/cita/cancelarCita")
                        .header("Authorization", "Bearer " + asesorToken)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isOk());

        assertThat(notificaciones.findByUsuarioIdOrderByFechaDesc(clienteId))
                .anyMatch(n -> n.getTipo().equals("Cancelada") && n.getCita() != null
                        && n.getCita().getId().equals(citaId));

        mvc.perform(post("/api/cita/cancelarCita")
                        .header("Authorization", "Bearer " + asesorToken)
                        .contentType(APPLICATION_JSON)
                        .content("{\"citaId\":" + citaId + "}"))
                .andExpect(status().isConflict());
    }

    private long crearCita(String token, Long asesorId) throws Exception {
        MvcResult result = mvc.perform(post("/api/cita/agregarCita")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(citaBody(asesorId, 1L, FRANJA_ISO)))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result).get("cita").get("_id").asLong();
    }

    private String login(String correo) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(loginBody(correo)))
                .andExpect(status().isOk())
                .andReturn();
        return read(result).get("token").asText();
    }

    private String loginBody(String correo) {
        return "{\"correo\":\"" + correo + "\",\"password\":\"" + PASSWORD + "\"}";
    }

    private String citaBody(Long asesorId, Long tipoCitaId, String fechaIso) {
        return "{\"asesorId\":" + asesorId + ",\"tipoCitaId\":" + tipoCitaId + ",\"fechaCita\":\"" + fechaIso
                + "\",\"descripcion\":\"Diagnóstico de equipo\"}";
    }

    private Long id(String correo) {
        return usuarios.findByCorreo(correo).orElseThrow().getId();
    }

    private JsonNode read(MvcResult result) throws Exception {
        return om.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private boolean containsId(JsonNode array, Long id) {
        for (JsonNode item : array) {
            if (item.hasNonNull("_id") && item.get("_id").asLong() == id) {
                return true;
            }
        }
        return false;
    }

    private boolean containsProducto(JsonNode array, Long id) {
        for (JsonNode item : array) {
            if (item.hasNonNull("id") && item.get("id").asLong() == id) {
                return true;
            }
        }
        return false;
    }

    private void assertSortedAsc(JsonNode citas) {
        Instant previo = null;
        for (JsonNode cita : citas) {
            Instant actual = Instant.parse(cita.get("fechaCita").asText());
            if (previo != null) {
                assertThat(actual).isAfterOrEqualTo(previo);
            }
            previo = actual;
        }
    }
}