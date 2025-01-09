package com.none.kollappbackend.core.config;

import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.core.util.ResponseUtil;
import com.none.kollappbackend.core.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ResponseUtil responseUtil;

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                if (jwtUtil.validateAuthenticationToken(jwt)) {
                    String username = jwtUtil.getSubjectFromAuthenticationToken(jwt);
                    OrganizationDetails organizationDetails = (OrganizationDetails) userDetailsService
                            .loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            organizationDetails,
                            null,
                            organizationDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    responseUtil.createMessageResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                            messageSource.getMessage("error.jwt.authentication.invalid", null,
                                    LocaleContextHolder.getLocale()));
                    return;
                }
            }
        } catch (Exception e) {
            responseUtil.createMessageResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    messageSource.getMessage(e.getMessage(), null, LocaleContextHolder.getLocale()));
        }
        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}