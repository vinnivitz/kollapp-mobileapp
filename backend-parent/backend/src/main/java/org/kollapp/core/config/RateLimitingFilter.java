package org.kollapp.core.config;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.config.properties.RateLimitProperties;
import org.kollapp.core.util.ResponseUtil;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private final Cache<String, Bucket> buckets;
    private final RateLimitProperties rateLimitProperties;

    @Autowired
    private MessageUtil messageUtil;

    @Autowired
    private ResponseUtil responseUtil;

    /**
     * Constructor for RateLimitingFilter.
     *
     * @param rateLimitProperties the rate limit properties
     * @return a new RateLimitingFilter instance
     */
    public RateLimitingFilter(RateLimitProperties rateLimitProperties) {
        this.rateLimitProperties = rateLimitProperties;
        long expirationSeconds = rateLimitProperties.getSeconds() + 10L;
        this.buckets = Caffeine.newBuilder()
                .maximumSize(rateLimitProperties.getMaxCacheSize())
                .expireAfterAccess(expirationSeconds, TimeUnit.SECONDS)
                .build();
    }

    /**
     * It intercepts the incoming requests and checks if the request is allowed based on the rate
     * limit per user.
     *
     * @param request the HTTP request
     * @param response the HTTP response
     * @param chain the filter chain
     * @throws ServletException if a servlet exception occurs
     * @throws IOException if an I/O exception occurs
     */
    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String userKey = getUserKey(request);
        Bucket bucket = buckets.get(userKey, k -> createBucket());

        if (!bucket.tryConsume(1)) {
            String message = messageUtil.getMessage("error.ratelimit");
            responseUtil.createMessageResponse(response, HttpStatus.TOO_MANY_REQUESTS.value(), message);
            return;
        }
        chain.doFilter(request, response);
    }

    /**
     * Gets the user key for rate limiting. For authenticated users, returns the username.
     * For anonymous users, returns the IP address.
     *
     * @param request the HTTP request
     * @return the user key
     */
    private String getUserKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof UserDetails) {
            return "user:" + authentication.getName();
        }
        return "ip:" + getClientIpAddress(request);
    }

    /**
     * Extracts the client IP address from the request, considering proxy headers.
     *
     * @param request the HTTP request
     * @return the client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Creates a new bucket with the configured rate limit.
     *
     * @return a new Bucket instance
     */
    private Bucket createBucket() {
        Refill refill = Refill.intervally(
                rateLimitProperties.getRequests(), Duration.ofSeconds(rateLimitProperties.getSeconds()));
        Bandwidth limit = Bandwidth.classic(rateLimitProperties.getRequests(), refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
