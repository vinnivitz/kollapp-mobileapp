package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import com.none.kollappbackend.organization.application.exception.EmailIsNotConfirmedException;
import com.none.kollappbackend.organization.application.exception.InvalidRefreshTokenException;
import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.organization.application.model.AuthenticatedOrganization;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.AuthService;
import com.none.kollappbackend.core.util.JwtUtil;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OrganizationRepository orgaRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedOrganization authenticate(String username, String password) {
        if (!orgaRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException(messageSource);
        }
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        OrganizationDetails organizationDetails = (OrganizationDetails) authentication.getPrincipal();
        if (!organizationDetails.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        String accessToken = jwtUtil.generateAuthenticationToken(organizationDetails.getUsername(),
                expirationDate);
        String refreshToken = jwtUtil.generateRefreshToken(organizationDetails.getUsername());
        return AuthenticatedOrganization.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(organizationDetails.getUsername())
                .email(organizationDetails.getEmail())
                .build();
    }

    @Override
    public String refresh(String token) {
        if (!jwtUtil.validateRefreshToken(token)) {
            throw new InvalidRefreshTokenException(messageSource);
        }

        String username = jwtUtil.getSubjectFromRefreshToken(token);
        Organization organization = orgaRepo.findByUsername(username)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        if (!organization.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        return jwtUtil.generateAuthenticationToken(username, expirationDate);
    }
}
