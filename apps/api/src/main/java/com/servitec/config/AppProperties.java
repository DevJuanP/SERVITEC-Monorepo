package com.servitec.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Security security, Cors cors) {

    public record Security(String jwtSecret, long jwtExpirationMinutes) {
    }

    public record Cors(List<String> allowedOrigins) {
    }
}