package com.none.orgaappbackend.core;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OrgaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrgaBackendApplication.class, args);
	}

	@Bean
	OpenAPI openAPI() {
		return new OpenAPI()
				.components(new Components()
						.addSecuritySchemes("bearer-key",
								new SecurityScheme().type(SecurityScheme.Type.HTTP)
										.scheme("bearer")
										.bearerFormat("JWT")));
	}

}
