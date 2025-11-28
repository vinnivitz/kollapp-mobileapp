FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

COPY .mvn/ .mvn/
COPY mvnw ./
COPY pom.xml ./

COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY backend/sun_checks.xml backend/sun_checks.xml

WORKDIR /build/backend

RUN ../mvnw -B dependency:go-offline
RUN ../mvnw -B -DskipTests -Djqassistant.skip=true clean package && mv target/*.jar /build/app.jar

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

COPY --from=builder --chown=spring:spring /build/app.jar app.jar

USER spring:spring

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --spider http://localhost:8080/actuator/health/liveness || exit 1

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]