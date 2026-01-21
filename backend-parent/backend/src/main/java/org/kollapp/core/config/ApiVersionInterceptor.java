package org.kollapp.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor that extracts the API version from the request header and makes it available
 * for downstream processing. If no version header is present, the attribute is set to null,
 * indicating the client is assumed to be on the latest version.
 */
@Component
public class ApiVersionInterceptor implements HandlerInterceptor {

    private static final String API_VERSION_HEADER = "API-Version";
    public static final String API_VERSION_ATTRIBUTE = "apiVersion";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String version = request.getHeader(API_VERSION_HEADER);
        if (version != null && version.isEmpty()) {
            version = null;
        }
        request.setAttribute(API_VERSION_ATTRIBUTE, version);
        return true;
    }
}
