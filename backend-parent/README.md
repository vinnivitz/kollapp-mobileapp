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
   cd backend
   # Copy and edit environment variables
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Build and run**:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run -pl backend
   ```

4. **Access the application**:
   - API: http://localhost:8080
   - OpenAPI Docs: http://localhost:8080/swagger-ui.html
   - Actuator Health: http://localhost:8080/actuator/health
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

# Architecture validation for backend
./mvnw jqassistant:analyze
```

## Code Quality

- **Formatting**: Google Java Format (AOSP style) via Spotless
- **Linting**: Checkstyle with Sun checks
- **Code Coverage**: JaCoCo
- **Architecture Tests**: jQAssistant

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
cd backend
docker build -t kollapp/backend:latest .
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
  kollapp/backend:latest
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

TypeScript type definitions are generated for frontend JS clients in the `backend-api` module.

## Configuration

Key configuration files:
- `backend/src/main/resources/srcapplication.yml` - Main Spring Boot configuration
- `backend/.env` - Environment-specific variables (local development)
- `.jqassistant.yml` - Architecture rules

### Environment Variables

See `.env.example` for all available configuration options.

Required for production:
- `BACKEND_JWT_*_SECRET` - JWT signing secrets
- `BACKEND_DB_*` - Database credentials
- `BACKEND_PRODUCTION=true`

## Deployment

### CI/CD

GitHub Actions workflows:
- `backend-ci.yml` - Build, test, and deploy releases
- `run_on_main_at_commit.yml` - Run tests on every commit

## Tech Stack

- **Framework**: Spring Boot 3.3.5
- **Java**: 21
- **Database**: MySQL 8.4.7 (with HikariCP)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA + Hibernate
- **API Docs**: SpringDoc OpenAPI
- **Testing**: JUnit 5, Testcontainers, Spring Security Test
- **Monitoring**: Spring Boot Actuator
- **Architecture**: jMolecules, jQAssistant