package com.none.orgaappbackend.organization.util;

import com.none.orgaappbackend.organization.application.model.Organization;
import com.none.orgaappbackend.organization.application.model.OrganizationDetails;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;

import java.security.Key;
import java.util.Date;

public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final static String jwtSecret = "cf8b2b587e830bc35c0c61a8035bf5c78b80d962363520cdf3caeba3cb42c830";
    private final static Long jwtExpirationMs = 7776000000L;


    public static String generateJwtTokenForConfirmation(Organization organization){
        return Jwts.builder()
                .setSubject(organization.getId().toString())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public static Date generateExpirationDate(){
        return new Date((new Date()).getTime() + jwtExpirationMs);
    }
    public static String generateJwtToken(Authentication authentication, Date expirationDate) {
        OrganizationDetails orgaPrincipal = (OrganizationDetails) authentication.getPrincipal();
        return Jwts.builder()
                .setSubject((orgaPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(expirationDate)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private static Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public static String getSubjectFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public static boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
