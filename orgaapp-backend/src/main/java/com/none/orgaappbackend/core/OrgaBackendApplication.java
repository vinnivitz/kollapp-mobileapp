package com.none.orgaappbackend.core;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class}, scanBasePackages = "com.none.orgaappbackend.*")
@EnableJpaRepositories("com.none.orgaappbackend.*")
@EntityScan("com.none.orgaappbackend.*")
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
