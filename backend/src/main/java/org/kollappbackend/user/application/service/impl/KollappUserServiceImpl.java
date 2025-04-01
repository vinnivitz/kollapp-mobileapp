package org.kollappbackend.user.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.config.ClientPlatform;
import org.kollappbackend.core.util.JwtUtil;
import org.kollappbackend.core.util.UrlBuilderUtil;
import org.kollappbackend.user.application.exception.*;
import org.kollappbackend.user.application.model.ERole;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.KollappUserDeletedEvent;
import org.kollappbackend.user.application.model.KollappUserDetails;
import org.kollappbackend.user.application.publisher.KollappUserPublisher;
import org.kollappbackend.user.application.repository.KollappUserRepository;
import org.kollappbackend.user.application.service.EmailService;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.lang.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
public class KollappUserServiceImpl implements KollappUserService {
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private UrlBuilderUtil urlBuilderUtil;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private KollappUserRepository userRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private KollappUserPublisher kollappUserPublisher;

    public KollappUser getKollappUserByUsername(String username) {
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

    @Override
    public KollappUser getLoggedInKollappUser() {
        String username = ((KollappUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal()).getUsername();
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

    @Override
    public KollappUser getKollappUserByEmail(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new EmailNotFoundException(messageSource));
    }

    @Override
    public void activateKollappUser(String confirmationToken) {
        if (!jwtUtil.validateConfirmationToken(confirmationToken)) {
            throw new InvalidConfirmationLinkException(messageSource);
        }
        String username = jwtUtil.getSubjectFromConfirmationToken(confirmationToken);
        KollappUser kollappUser = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("error.user.not-found"));
        if (kollappUser.isActivated()) {
            throw new EmailIsAlreadyConfirmedException(messageSource);
        }
        kollappUser.setActivated(true);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        String usernameOfLoggedInUser = getLoggedInKollappUser().getUsername();
        KollappUser kollappUser = getKollappUserByUsername(usernameOfLoggedInUser);
        boolean oldPasswordIsCorrect = encoder.matches(oldPassword, kollappUser.getPassword());
        if (!oldPasswordIsCorrect) {
            throw new IncorrectPasswordException(messageSource);
        }
        kollappUser.setPassword(encoder.encode(newPassword));
    }

    @Override
    public void forgotPassword(String email) {
        KollappUser kollappUser = getKollappUserByEmail(email);
        String token = jwtUtil.generateResetPasswordToken(kollappUser.getUsername());
        emailService.sendForgotPasswordMail(email, createResetPasswordBaseUrl(token));
    }

    @Override
    public void resetPassword(String token, String password) {
        if (!jwtUtil.validateResetPasswordToken(token)) {
            throw new InvalidConfirmationLinkException(messageSource);
        }
        String username = jwtUtil.getSubjectFromResetPasswordToken(token);
        KollappUser kollappUser = getKollappUserByUsername(username);
        kollappUser.setPassword(encoder.encode(password));
    }

    @Override
    public void register(String username, String email, String password, String name, String surname,
                         List<ERole> roles) {
        if (userRepo.existsByUsername(username)) {
            throw new UsernameExistsException(messageSource);
        }
        if (userRepo.existsByEmail(email)) {
            throw new EmailExistsException(messageSource);
        }
        String encodedPassword = encoder.encode(password);
        KollappUser kollappUser =
                KollappUser.builder().username(username).email(email).name(name).surname(surname).isActivated(false)
                        .password(encodedPassword).roles(roles).build();
        userRepo.save(kollappUser);
        String confirmationToken = jwtUtil.generateConfirmationToken(username);
        emailService.sendConfirmationMail(kollappUser.getEmail(), createConfirmationBaseUrl(confirmationToken));
    }

    @Override
    public KollappUser updateKollappUser(@Nullable String username, @Nullable String email, @Nullable String surename,
                                         @Nullable String name) {
        KollappUser kollappUser = getLoggedInKollappUser();
        if (username != null && !kollappUser.getUsername().equals(username)) {
            kollappUser.setUsername(username);
        }
        if (email != null && !kollappUser.getEmail().equals(email)) {
            kollappUser.setActivated(false);
            kollappUser.setEmail(email);
            String confirmationToken = jwtUtil.generateConfirmationToken(username);
            String confirmationBaseUrl = createConfirmationBaseUrl(confirmationToken);
            emailService.sendConfirmationMail(kollappUser.getEmail(), confirmationBaseUrl);
            kollappUser.setEmail(email);
        }
        if (surename != null) {
            kollappUser.setSurname(surename);
        }
        if (name != null) {
            kollappUser.setName(name);
        }
        return kollappUser;
    }

    @Override
    public void deleteKollappUser() {
        KollappUser kollappUser = getLoggedInKollappUser();
        kollappUserPublisher.publishUserDeletedEvent(new KollappUserDeletedEvent(this, kollappUser.getId()));
        SecurityContextHolder.getContext().setAuthentication(null);
        userRepo.deleteById(kollappUser.getId());
    }

    private String createConfirmationBaseUrl(String token) {
        Map<String, String> params = Map.of("confirmationToken", token);
        return urlBuilderUtil.buildServerUrl("/api/public/user/confirmation", params);
    }

    private String createResetPasswordBaseUrl(String token) {
        Map<String, String> params = Map.of("resetPasswordToken", token);
        return urlBuilderUtil.buildClientUrl(ClientPlatform.WEB, "/auth/reset-password/confirmation", params);
    }
}
