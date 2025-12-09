package org.kollapp.core.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;

@Component
public class ApiVersionValidationInterceptor implements HandlerInterceptor {

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        ApiVersion apiVersion = handlerMethod.getMethod().getAnnotation(ApiVersion.class);

        if (apiVersion == null) {
            apiVersion = handlerMethod.getBeanType().getAnnotation(ApiVersion.class);
        }

        if (apiVersion == null) {
            return true;
        }

        String requestVersion = (String) request.getAttribute(ApiVersionInterceptor.API_VERSION_ATTRIBUTE);
        if (requestVersion == null) {
            requestVersion = "1.0";
        }

        // Check minimum version
        if (compareVersions(requestVersion, apiVersion.min()) < 0) {
            writeErrorResponse(response, HttpStatus.UPGRADE_REQUIRED, "error.api-version.too-old");
            return false;
        }

        // Check maximum version
        if (!apiVersion.max().isEmpty() && compareVersions(requestVersion, apiVersion.max()) > 0) {
            writeErrorResponse(response, HttpStatus.GONE, "error.api-version.too-new");
            return false;
        }

        return true;
    }

    private void writeErrorResponse(HttpServletResponse response, HttpStatus status, String messageKey)
            throws IOException {
        ErrorResponseTO errorResponse = new ErrorResponseTO(messageKey, messageSource);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private int compareVersions(String version1, String version2) {
        String[] parts1 = version1.split("\\.");
        String[] parts2 = version2.split("\\.");
        int maxLength = Math.max(parts1.length, parts2.length);

        for (int i = 0; i < maxLength; i++) {
            int v1 = i < parts1.length ? Integer.parseInt(parts1[i]) : 0;
            int v2 = i < parts2.length ? Integer.parseInt(parts2[i]) : 0;
            if (v1 != v2) {
                return Integer.compare(v1, v2);
            }
        }
        return 0;
    }
}
