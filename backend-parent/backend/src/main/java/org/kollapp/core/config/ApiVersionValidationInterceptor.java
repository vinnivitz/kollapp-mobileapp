package org.kollapp.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;

@Component
public class ApiVersionValidationInterceptor implements HandlerInterceptor {

    @Autowired
    private MessageUtil messageUtil;

    @Autowired
    private MappingJackson2HttpMessageConverter messageConverter;

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

        // If no version header was sent, assume client is on the latest version
        if (requestVersion == null) {
            return true;
        }

        if (!isVersionAtLeast(requestVersion, apiVersion.min())) {
            String message = messageUtil.getMessage("error.api-version.too-old");
            ErrorResponseTO errorResponse = new ErrorResponseTO(message);
            response.setStatus(HttpStatus.UPGRADE_REQUIRED.value());
            messageConverter.write(errorResponse, MediaType.APPLICATION_JSON, new ServletServerHttpResponse(response));
            return false;
        }

        return true;
    }

    private boolean isVersionAtLeast(String requestVersion, String minVersion) {
        String[] requestParts = requestVersion.split("\\.");
        String[] minParts = minVersion.split("\\.");
        int length = Math.max(requestParts.length, minParts.length);

        for (int i = 0; i < length; i++) {
            int request = i < requestParts.length ? Integer.parseInt(requestParts[i]) : 0;
            int min = i < minParts.length ? Integer.parseInt(minParts[i]) : 0;
            if (request > min) {
                return true;
            }
            if (request < min) {
                return false;
            }
        }
        return true;
    }
}
