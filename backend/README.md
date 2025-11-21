# Kollapp Backend

A Spring Boot backend application using hexagonal architecture with DDD principles.

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) with **Domain-Driven Design** principles:

- **Core Domain**: Business logic isolated from infrastructure
- **Primary Adapters**: REST Controllers, Event Listeners
- **Secondary Adapters**: Database Repositories, Email Service
- **Application Layer**: Use cases and services

Architecture validation is enforced using jQAssistant with jMolecules.

## Getting Started

### Prerequisites

- Java 21
- Docker & Docker Compose

### Local Development Setup

1. **Start infrastructure services**:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Configure environment**:
   ```bash
   # Copy and edit environment variables
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Build and run**:
   ```bash
   ./mvnw clean install
   cd server
   ./mvnw spring-boot:run
   ```

4. **Access the application**:
   - API: http://localhost:8080
   - OpenAPI Docs: http://localhost:8080/swagger-ui.html
   - Actuator Health: http://localhost:8080/actuator/health
   - Metrics: http://localhost:8080/actuator/prometheus
   - MailHog UI: http://localhost:8025

## Testing

```bash
# Run unit tests
./mvnw test

# Run integration tests
./mvnw verify

# Run with coverage
./mvnw clean verify
# Coverage report: target/site/jacoco/index.html

# Architecture validation
./mvnw jqassistant:analyze
```

**Note**: Minimum code coverage is enforced at **80% line coverage** and **75% branch coverage**.

## Code Quality

- **Formatting**: Google Java Format (AOSP style) via Spotless
- **Linting**: Checkstyle with Sun checks
- **Code Coverage**: JaCoCo (80% minimum)
- **Architecture Tests**: jQAssistant
- **Security Scanning**: CodeQL (GitHub Actions)

```bash
# Check code formatting
./mvnw spotless:check

# Apply formatting
./mvnw spotless:apply

# Run Checkstyle
./mvnw checkstyle:check
```

## Docker

### Build Image
```bash
cd server
docker build -t kollapp-backend:latest .
```

The Dockerfile uses:
- Multi-stage build for optimal size
- Non-root user for security
- Health checks
- JVM container optimizations

### Run Container
```bash
docker run -p 8080:8080 \
  --env-file ../backend/.env \
  kollapp-backend:latest
```

## Security

- JWT-based authentication with multiple token types
- Encrypted secrets using environment variables
- Rate limiting with Bucket4j
- CORS configuration
- Security headers (CSP, HSTS, X-Frame-Options, etc.)

## API Documentation

OpenAPI 3.0 documentation is auto-generated and available at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

TypeScript type definitions are generated for frontend JS clients in the `api-types` module.

## Configuration

Key configuration files:
- `application.yml` - Main Spring Boot configuration
- `.env` - Environment-specific variables (local development)
- `.jqassistant.yml` - Architecture rules

### Environment Variables

See `.env.example` for all available configuration options.

Required for production:
- `BACKEND_JWT_*_SECRET` - JWT signing secrets
- `BACKEND_DB_*` - Database credentials
- `BACKEND_PRODUCTION=true`

## Project Structure

```
backend/
├── pom.xml                 # Parent POM
├── server/                 # Main application
│   ├── src/main/java/
│   │   └── org/kollappbackend/
│   │       ├── core/       # Shared infrastructure
│   │       ├── user/       # User bounded context
│   │       └── organization/ # Organization bounded context
│   └── src/main/resources/
└── api-types/              # TypeScript type generation
```

## Deployment

### CI/CD

GitHub Actions workflows:
- `backend-ci.yml` - Build, test, and deploy releases
- `run_on_main_at_commit.yml` - Run tests on every commit
- `codeql.yml` - Security scanning

## Tech Stack

- **Framework**: Spring Boot 3.3.5
- **Java**: 21
- **Database**: MySQL 8.4 (with HikariCP)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA + Hibernate
- **API Docs**: SpringDoc OpenAPI
- **Testing**: JUnit 5, Testcontainers, Spring Security Test
- **Monitoring**: Micrometer, Prometheus, Spring Boot Actuator
- **Architecture**: jMolecules, jQAssistant