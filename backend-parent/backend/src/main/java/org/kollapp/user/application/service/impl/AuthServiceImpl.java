package org.kollapp.user.application.service.impl;

import java.util.Date;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.kollapp.user.application.model.AuthTokens;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.KollappUserDetails;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.AuthService;

@Slf4j
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private KollappUserRepository userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthTokens authenticate(String username, String password) {
        if (!userRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException();
        }
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        KollappUserDetails kollappUserDetails = (KollappUserDetails) authentication.getPrincipal();
        if (!kollappUserDetails.isActivated()) {
            throw new EmailIsNotConfirmedException();
        }
        String accessToken = jwtUtil.generateAuthenticationToken(kollappUserDetails.getUsername(), expirationDate);
        String refreshToken = jwtUtil.generateRefreshToken(kollappUserDetails.getUsername());
        return new AuthTokens(accessToken, refreshToken);
    }

    @Override
    public String refresh(String token) {
        if (!jwtUtil.validateRefreshToken(token)) {
            throw new InvalidRefreshTokenException();
        }

        String username = jwtUtil.getSubjectFromRefreshToken(token);
        KollappUser kollappUser = userRepo.findByUsername(username).orElseThrow(KollappUserNotFoundException::new);
        if (!kollappUser.isActivated()) {
            throw new EmailIsNotConfirmedException();
        }
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        return jwtUtil.generateAuthenticationToken(username, expirationDate);
    }
}
