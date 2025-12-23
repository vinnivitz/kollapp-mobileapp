package org.kollapp.core.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.util.ResponseUtil;

@Slf4j
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    @Autowired
    private MessageUtil messageUtil;

    @Autowired
    private ResponseUtil responseUtil;

    @Autowired
    private EndpointResolver endpointResolver;

    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        if (endpointResolver.endpointExists(request)) {
            responseUtil.createMessageResponse(
                    response, HttpServletResponse.SC_UNAUTHORIZED, messageUtil.getMessage("error.authentication"));
        } else {
            responseUtil.createMessageResponse(
                    response, HttpServletResponse.SC_NOT_FOUND, messageUtil.getMessage("error.resource-not-found"));
        }
    }
}
