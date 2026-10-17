package com.servitec;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.servitec.service.ProductoService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class P07DatabaseFailureTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ProductoService productoService;

    @Test
    void p07BaseDeDatosCaida() throws Exception {
        given(productoService.publicos(null, null))
                .willThrow(new DataAccessResourceFailureException("BD caída"));

        mvc.perform(get("/api/productos"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").isNotEmpty());
    }
}