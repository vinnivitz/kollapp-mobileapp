package com.none.kollappbackend.core.util;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.Key;
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
     * @param expirationInSeconds number of milliseconds until the token should
     *                            expire
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
        Key signingKey = generateSigningKey(jwtProperties.getAuthSecret());
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
     * @return a signed confirmation JWT as a {@link String}
     */
    public String generateConfirmationToken(String subject) {
        Key signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
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
        Key signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(generateExpirationDate(jwtProperties.getRefreshExpirationInSeconds()))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates a JWT token for resetting a password.
     *
     * @param subject the subject
     * @return a signed reset password JWT as a {@link String}
     */
    public String generateResetPasswordToken(String subject) {
        Key signingKey = generateSigningKey(jwtProperties.getResetPasswordSecret());
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(generateExpirationDate(jwtProperties.getResetPasswordExpirationInSeconds()))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getSubjectFromAuthenticationToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getAuthSecret());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Retrieves the subject from a confirmation token.
     *
     * @param token the JWT token
     */
    public String getSubjectFromConfirmationToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
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
     * @return the subject
     */
    public String getSubjectFromRefreshToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Retrieves the subject from a reset password token.
     *
     * @param token the JWT token
     * @return the subject
     */
    public String getSubjectFromResetPasswordToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getResetPasswordSecret());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validates the given authentication token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateAuthenticationToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getAuthSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Validates the given confirmation token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateConfirmationToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getConfirmationSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Validates the given refresh token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateRefreshToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getRefreshSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Validates the given reset password token (checks format and expiration).
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateResetPasswordToken(String token) {
        Key signingKey = generateSigningKey(jwtProperties.getResetPasswordSecret());
        return validateToken(token, signingKey);
    }

    /**
     * Generates a SecretKey from the provided Base64-encoded secret.
     *
     * @param secret Base64-encoded secret string
     * @return the corresponding {@link SecretKey}
     */
    private Key generateSigningKey(String secret) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * Parses and validates the JWT token using the given {@link Key}.
     *
     * @param token the JWT token
     * @param signingKey the key used to sign the token
     * @return true if the token is valid, false otherwise
     */
    private boolean validateToken(String token, Key signingKey) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception exception) {
            if (exception instanceof ExpiredJwtException) {
                log.error("JWT token is expired: " + exception.getMessage());
            } else if (exception instanceof MalformedJwtException) {
                log.error("Invalid JWT format: " + exception.getMessage());
            } else if (exception instanceof JwtException) {
                log.error("JWT parsing failed: " + exception.getMessage());
            } else if (exception instanceof IllegalArgumentException) {
                log.error("JWT claims string is empty: " + exception.getMessage());
            }
        }
        return false;

    }
}
