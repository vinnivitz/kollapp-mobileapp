package org.kollapp.user.application.service.impl;

import java.util.Date;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.kollapp.core.config.properties.JwtProperties;
import org.kollapp.core.util.JwtUtil;
import org.kollapp.user.application.exception.EmailIsNotConfirmedException;
import org.kollapp.user.application.exception.InvalidRefreshTokenException;
import org.kollapp.user.application.exception.KollappUserNotFoundException;
import org.kollapp.user.application.exception.UsernameNotFoundException;
import org.kollapp.user.application.model.AuthenticatedKollappUser;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.KollappUserDetails;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.AuthService;

@Slf4j
@Service
@Transactional
public class AuthServiceImpl implements AuthService {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private KollappUserRepository userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedKollappUser authenticate(String username, String password) {
        if (!userRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException(messageSource);
        }
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        KollappUserDetails kollappUserDetails = (KollappUserDetails) authentication.getPrincipal();
        if (!kollappUserDetails.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        String accessToken = jwtUtil.generateAuthenticationToken(kollappUserDetails.getUsername(), expirationDate);
        String refreshToken = jwtUtil.generateRefreshToken(kollappUserDetails.getUsername());
        return AuthenticatedKollappUser.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(kollappUserDetails.getUsername())
                .email(kollappUserDetails.getEmail())
                .build();
    }

    @Override
    public String refresh(String token) {
        if (!jwtUtil.validateRefreshToken(token)) {
            throw new InvalidRefreshTokenException(messageSource);
        }

        String username = jwtUtil.getSubjectFromRefreshToken(token);
        KollappUser kollappUser =
                userRepo.findByUsername(username).orElseThrow(() -> new KollappUserNotFoundException(messageSource));
        if (!kollappUser.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        return jwtUtil.generateAuthenticationToken(username, expirationDate);
    }
}
