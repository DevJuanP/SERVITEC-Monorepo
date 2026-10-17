package com.servitec;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ServitecApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServitecApplication.class, args);
    }
}