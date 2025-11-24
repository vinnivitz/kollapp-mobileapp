package org.kollapp.core.config;

import java.io.IOException;
import java.time.Duration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.kollapp.core.config.properties.RateLimitProperties;
import org.kollapp.core.util.ResponseUtil;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private final Bucket bucket;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ResponseUtil responseUtil;

    /**
     * Constructor for RateLimitingFilter.
     *
     * @param rateLimitProperties the rate limit properties
     * @return a new RateLimitingFilter instance
     */
    public RateLimitingFilter(RateLimitProperties rateLimitProperties) {
        Refill refill = Refill.intervally(
                rateLimitProperties.getRequests(), Duration.ofSeconds(rateLimitProperties.getSeconds()));
        Bandwidth limit = Bandwidth.classic(rateLimitProperties.getRequests(), refill);
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    /**
     * It intercepts the incoming requests and checks if the request is allowed based on the rate
     * limit.
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
        if (!bucket.tryConsume(1)) {
            responseUtil.createMessageResponse(
                    response,
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    messageSource.getMessage("error.ratelimit", null, LocaleContextHolder.getLocale()));
            return;
        }
        chain.doFilter(request, response);
    }
}
