package org.kollapp.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import org.kollapp.core.config.properties.ApplicationProperties;

/**
 * Interceptor that extracts the API version from the request header and makes it available
 * for downstream processing. If no version header is present, uses the configured minimum API version.
 */
@Component
public class ApiVersionInterceptor implements HandlerInterceptor {

    private static final String API_VERSION_HEADER = "API-Version";
    public static final String API_VERSION_ATTRIBUTE = "apiVersion";

    @Autowired
    private ApplicationProperties applicationProperties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String version = request.getHeader(API_VERSION_HEADER);
        if (version == null || version.isEmpty()) {
            version = applicationProperties.getMinApiVersion();
        }
        request.setAttribute(API_VERSION_ATTRIBUTE, version);
        return true;
    }
}
