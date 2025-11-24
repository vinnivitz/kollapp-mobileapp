# Kollapp Backend Parent

Multi-module Maven project for the Kollapp backend application.

## Project Structure

This is a Maven parent project containing the following modules:

- **`backend/`** - Main Spring Boot application (server module)
  - REST API, business logic, persistence
  - Uses hexagonal architecture with DDD principles
  - Packaged as executable JAR
- **`backend-api/`** - TypeScript API type definitions
  - Auto-generated types for frontend clients
  - Published as npm package

## Architecture

The `backend` module follows **Hexagonal Architecture** (Ports & Adapters) with **Domain-Driven Design** principles:

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

3. **Build project**:
   ```bash
   ./mvnw clean install
   ```

4. **Run the backend application**:
   ```bash
   ./mvnw spring-boot:run -pl backend
   ```

4. **Access backend application**:
   - API: http://localhost:8080
   - OpenAPI Docs: http://localhost:8080/swagger-ui.html
   - Actuator Health: http://localhost:8080/actuator/health
   - MailHog UI: http://localhost:8025

## Testing

Run from the parent directory:

```bash
# Run tests
./mvnw verify

# Run with coverage report
./mvnw clean verify
# Coverage report: backend/target/site/jacoco/index.html

# Architecture validation
./mvnw jqassistant:analyze -pl backend
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
- `pom.xml` - Parent POM with dependency management
- `backend/pom.xml` - Backend module configuration
- `backend/src/main/resources/application.yml` - Spring Boot configuration
- `backend/.env` - Environment-specific variables (local development)
- `jqassistant/` - Architecture validation rules

### Environment Variables

See `.env.example` for all available configuration options.

Required for production:
- `BACKEND_JWT_*_SECRET` - JWT signing secrets
- `BACKEND_DB_*` - Database credentials
- `BACKEND_PRODUCTION=true`

## Module Details

### Backend Module (`backend/`)

The main Spring Boot application server. See `backend/README.md` for module-specific documentation.

Build artifact: `backend/target/server-{version}.jar`

### Backend API Module (`backend-api/`)

Contains auto-generated TypeScript type definitions from Java DTOs.

Generate types:
```bash
./mvnw process-classes -pl backend -P generate-client-api-types
```

Output: `backend-api/ts/index.d.ts`

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