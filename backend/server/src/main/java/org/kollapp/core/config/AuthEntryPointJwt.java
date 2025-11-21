package org.kollapp.core.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import org.kollapp.core.util.ResponseUtil;

@Slf4j
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    @Autowired
    private MessageSource messageSource;

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
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    messageSource.getMessage("error.authentication", null, LocaleContextHolder.getLocale()));
        } else {
            responseUtil.createMessageResponse(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    messageSource.getMessage("error.resource-not-found", null, LocaleContextHolder.getLocale()));
        }
    }
}
