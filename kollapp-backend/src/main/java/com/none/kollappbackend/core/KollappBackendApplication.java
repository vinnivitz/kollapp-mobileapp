package com.none.kollappbackend.core;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.none.kollappbackend.core.config.properties.ApplicationProperties;

@SpringBootApplication(scanBasePackages = "com.none.kollappbackend")
@EnableJpaRepositories("com.none.kollappbackend.*")
@EntityScan("com.none.kollappbackend.*")
public class KollappBackendApplication {
	@Autowired
	private ApplicationProperties applicationProperties;

	/**
	 * Main method to run the Spring Boot application.
	 */
	public static void main(String[] args) {
		SpringApplication.run(KollappBackendApplication.class, args);
	}

	/**
	 * Configure OpenAPI documentation with a bearer token security scheme.
	 */
	@Bean
	OpenAPI openAPI() {
		return new OpenAPI()
				.info(new Info().title("Kollapp Backend API").description("API Documentation for Kollapp Backend")
						.version(applicationProperties.getVersion()))
				.addSecurityItem(new SecurityRequirement().addList("bearer-key"))
				.components(new Components()
						.addSecuritySchemes("bearer-key",
								new SecurityScheme().type(SecurityScheme.Type.HTTP)
										.scheme("bearer")
										.bearerFormat("JWT")));
	}
}
