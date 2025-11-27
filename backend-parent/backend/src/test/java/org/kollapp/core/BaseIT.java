package org.kollapp.core;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import org.kollapp.KollappApplication;

@Testcontainers
@SpringBootTest(classes = KollappApplication.class)
public abstract class BaseIT {

    static final MySQLContainer<?> MY_SQL_CONTAINER;

    static {
        String version = System.getenv().getOrDefault("MYSQL_VERSION", "8.4.4");
        MY_SQL_CONTAINER = new MySQLContainer<>("mysql:" + version).withReuse(false);
        MY_SQL_CONTAINER.start();
    }

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MY_SQL_CONTAINER::getJdbcUrl);
        registry.add("spring.datasource.username", MY_SQL_CONTAINER::getUsername);
        registry.add("spring.datasource.password", MY_SQL_CONTAINER::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
    }
}
