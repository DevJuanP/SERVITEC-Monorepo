package com.servitec.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TipoCitaDto(@JsonProperty("_id") Long id, String type) {
}