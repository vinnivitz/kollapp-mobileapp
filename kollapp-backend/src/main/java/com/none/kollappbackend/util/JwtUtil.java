package com.none.kollappbackend.util;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * Utility class for generating and validating JWT tokens.
 */
@AllArgsConstructor
@Slf4j
@Component
public class JwtUtil {

    private final JwtProperties jwtProperties;

    /**
     * Generates a future expiration {@link Date} by adding the specified number of
     * milliseconds to the current time.
     *
     * @param expirationInSeconds number of milliseconds until the token should expire
     * @return a future {@link Date}
     */
    public Date generateExpirationDate(long expirationInSeconds) {
        return Date.from(Instant.now().plusSeconds(expirationInSeconds));
    }

    /**
     * Generates a JWT token for user authentication.
     *
     * @param subject        the subject (usually a user identifier)
     * @param expirationDate the date at which the token should expire
     * @return a signed JWT as a {@link String}
     */
    public String generateAuthenticationToken(String subject, Date expirationDate) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getAuthSecret());
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(expirationDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates a JWT token for account confirmation.
     *
     * @param subject the subject (e.g., user ID or email) to be confirmed
     * @return a signed confirmation JWT as a {@link String}
     */
    public String generateConfirmationToken(String subject) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(generateExpirationDate(jwtProperties.getConfirmationExpirationInSeconds()))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates a JWT token for refreshing a session.
     *
     * @param subject the subject (usually a user identifier)
     * @return a signed refresh JWT as a {@link String}
     */
    public String generateRefreshToken(String subject) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(generateExpirationDate(jwtProperties.getRefreshExpirationInSeconds()))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Retrieves the subject from a confirmation token.
     *
     * @param token the JWT token
     * @return the subject (e.g., user ID) contained in the token
     */
    public String getSubjectFromConfirmationToken(String token) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Retrieves the subject from a refresh token.
     *
     * @param token the JWT token
     * @return the subject (e.g., user ID) contained in the token
     */
    public String getSubjectFromRefreshToken(String token) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validates the given confirmation token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateConfirmationToken(String token) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Validates the given refresh token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateRefreshToken(String token) {
        SecretKey signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Generates a SecretKey from the provided Base64-encoded secret.
     *
     * @param secret Base64-encoded secret string
     * @return the corresponding {@link SecretKey}
     */
    private SecretKey generateSigningKey(String secret) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * Parses and validates the JWT token using the given {@link SecretKey}.
     *
     * @param token      the JWT token
     * @param signingKey the key used to sign the token
     * @return true if the token is valid, false otherwise
     */
    private boolean validateToken(String token, SecretKey signingKey) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception exception) {
            if (exception instanceof ExpiredJwtException) {
                log.error("JWT token is expired: {}", exception.getMessage());
            } else if (exception instanceof MalformedJwtException) {
                log.error("Invalid JWT format: {}", exception.getMessage());
            } else if (exception instanceof JwtException) {
                log.error("JWT parsing failed: {}", exception.getMessage());
            } else if (exception instanceof IllegalArgumentException) {
                log.error("JWT claims string is empty: {}", exception.getMessage());
            }
        }
        return false;

    }
}
