package org.kollapp.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ApiVersionInterceptor implements HandlerInterceptor {

    private static final String API_VERSION_HEADER = "API-Version";
    private static final String DEFAULT_VERSION = "1.0";
    public static final String API_VERSION_ATTRIBUTE = "apiVersion";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String version = request.getHeader(API_VERSION_HEADER);
        if (version == null || version.isEmpty()) {
            version = DEFAULT_VERSION;
        }
        request.setAttribute(API_VERSION_ATTRIBUTE, version);
        return true;
    }
}
