package org.kollappbackend.user.application.service.impl;

import jakarta.transaction.Transactional;
import java.util.Date;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.config.properties.JwtProperties;
import org.kollappbackend.core.util.JwtUtil;
import org.kollappbackend.user.application.exception.EmailIsNotConfirmedException;
import org.kollappbackend.user.application.exception.InvalidRefreshTokenException;
import org.kollappbackend.user.application.exception.KollappUserNotFoundException;
import org.kollappbackend.user.application.exception.UsernameNotFoundException;
import org.kollappbackend.user.application.model.AuthenticatedKollappUser;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.KollappUserDetails;
import org.kollappbackend.user.application.repository.KollappUserRepository;
import org.kollappbackend.user.application.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Transactional
public class AuthServiceImpl implements AuthService {
    @Autowired private MessageSource messageSource;

    @Autowired private JwtProperties jwtProperties;

    @Autowired private JwtUtil jwtUtil;

    @Autowired private KollappUserRepository userRepo;

    @Autowired private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedKollappUser authenticate(String username, String password) {
        if (!userRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException(messageSource);
        }
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate =
                jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        KollappUserDetails kollappUserDetails = (KollappUserDetails) authentication.getPrincipal();
        if (!kollappUserDetails.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        String accessToken =
                jwtUtil.generateAuthenticationToken(
                        kollappUserDetails.getUsername(), expirationDate);
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
                userRepo.findByUsername(username)
                        .orElseThrow(() -> new KollappUserNotFoundException(messageSource));
        if (!kollappUser.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        Date expirationDate =
                jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        return jwtUtil.generateAuthenticationToken(username, expirationDate);
    }
}
