package com.none.kollappbackend.util;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import com.none.kollappbackend.organization.application.model.Organization;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

@Slf4j
@Component
public class JwtUtil {

    @Autowired
    private JwtProperties jwtProperties;

    /**
     * Generate a JWT token for an organization.
     * 
     * @param organization the organization for which the token is generated
     * @return a JWT token as a String
     */
    public String generateJwtTokenForConfirmation(Organization organization) {

        return Jwts.builder()
                .setSubject(organization.getId().toString())
                .setExpiration(generateExpirationDate(jwtProperties.getConfirmationExpirationMs()))
                .signWith(generateSigningKey(jwtProperties.getConfirmationSecret()), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate the signing key for a given secret.
     * 
     * @param secret the secret to use for generating the key
     * @return the signing key
     */
    public SecretKey generateSigningKey(String secret) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * Generates an expiration date based on the configured expiration period.
     * 
     * @return the expiration Date for a token
     */
    public Date generateExpirationDate(long expirationMs) {
        return Date.from(Instant.now().plusMillis(expirationMs));
    }

    /**
     * Generate a JWT token for a user (organization principal).
     * 
     * @param principalDetails the authenticated user's details
     * @param expirationDate   when the token should expire
     * @return a JWT token as a String
     */
    public String generateJwtTokenForAuthentication(String subject, Date expirationDate) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(expirationDate)
                .signWith(generateSigningKey(jwtProperties.getAuthSecret()), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the subject (usually username or user ID) from a given JWT token.
     * 
     * @param token the JWT token
     * @return the subject contained in the token
     */
    public String getSubjectFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(generateSigningKey(jwtProperties.getConfirmationSecret()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validates a given JWT token to ensure it is well-formed and not expired.
     * 
     * @param token the JWT token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateJwtTokenForAuthentication(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(generateSigningKey(jwtProperties.getAuthSecret())).build().parse(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token format: {}", e.getMessage(), e);
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage(), e);
        } catch (JwtException e) {
            log.error("JWT token parsing failed: {}", e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage(), e);
        }
        return false;
    }
}
