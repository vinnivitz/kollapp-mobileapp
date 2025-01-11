package com.none.kollappbackend.user.application.service.impl;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import com.none.kollappbackend.user.application.exception.EmailIsNotConfirmedException;
import com.none.kollappbackend.user.application.exception.InvalidRefreshTokenException;
import com.none.kollappbackend.user.application.exception.KollappUserNotFoundException;
import com.none.kollappbackend.user.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.user.application.model.AuthenticatedKollappUser;
import com.none.kollappbackend.user.application.model.KollappUser;
import com.none.kollappbackend.user.application.model.KollappUserDetails;
import com.none.kollappbackend.user.application.repository.KollappUserRepository;
import com.none.kollappbackend.user.application.service.AuthService;
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
    private KollappUserRepository userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedKollappUser authenticate(String username, String password) {
        if (!userRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException(messageSource);
        }
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        KollappUserDetails kollappUserDetails = (KollappUserDetails) authentication.getPrincipal();
        if (!kollappUserDetails.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        String accessToken = jwtUtil.generateAuthenticationToken(kollappUserDetails.getUsername(),
                expirationDate);
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
        KollappUser kollappUser = userRepo.findByUsername(username)
                .orElseThrow(() -> new KollappUserNotFoundException(messageSource));
        if (!kollappUser.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationInSeconds());
        return jwtUtil.generateAuthenticationToken(username, expirationDate);
    }
}
