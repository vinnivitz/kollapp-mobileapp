package org.kollappbackend.core.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Component
public class EndpointResolver {
    private final RequestMappingHandlerMapping requestMapping;

    @Autowired
    public EndpointResolver(
            @Qualifier("requestMappingHandlerMapping")
                    RequestMappingHandlerMapping handlerMapping) {
        this.requestMapping = handlerMapping;
    }

    public boolean endpointExists(HttpServletRequest request) {
        try {
            return requestMapping.getHandler(request) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
