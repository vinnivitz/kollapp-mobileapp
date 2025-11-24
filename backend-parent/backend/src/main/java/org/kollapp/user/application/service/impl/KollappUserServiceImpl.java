package org.kollapp.user.application.service.impl;

import java.util.Map;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.lang.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.kollapp.core.config.ClientPlatform;
import org.kollapp.core.util.JwtUtil;
import org.kollapp.core.util.UrlBuilderUtil;
import org.kollapp.user.application.exception.EmailExistsException;
import org.kollapp.user.application.exception.EmailIsAlreadyConfirmedException;
import org.kollapp.user.application.exception.EmailNotFoundException;
import org.kollapp.user.application.exception.IncorrectPasswordException;
import org.kollapp.user.application.exception.InvalidConfirmationLinkException;
import org.kollapp.user.application.exception.KollappUserNotFoundException;
import org.kollapp.user.application.exception.UsernameExistsException;
import org.kollapp.user.application.exception.UsernameNotFoundException;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.KollappUserDeletedEvent;
import org.kollapp.user.application.model.KollappUserDetails;
import org.kollapp.user.application.model.KollappUserUpdatedEvent;
import org.kollapp.user.application.model.RequiresKollappUserRole;
import org.kollapp.user.application.model.SystemRole;
import org.kollapp.user.application.publisher.KollappUserPublisher;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.EmailService;
import org.kollapp.user.application.service.KollappUserService;

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
    @RequiresKollappUserRole
    public KollappUser getLoggedInKollappUser() {
        Object principal =
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof User) {
            username = ((User) principal).getUsername();
        } else {
            username = ((KollappUserDetails) principal).getUsername();
        }
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
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
    @RequiresKollappUserRole
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
    public void register(String username, String email, String password) {
        if (userRepo.existsByUsername(username)) {
            throw new UsernameExistsException(messageSource);
        }
        if (userRepo.existsByEmail(email)) {
            throw new EmailExistsException(messageSource);
        }
        String encodedPassword = encoder.encode(password);
        KollappUser kollappUser = KollappUser.builder()
                .username(username)
                .email(email)
                .isActivated(false)
                .password(encodedPassword)
                .role(SystemRole.ROLE_KOLLAPP_USER)
                .build();
        userRepo.save(kollappUser);
        String confirmationToken = jwtUtil.generateConfirmationToken(username);
        emailService.sendConfirmationMail(kollappUser.getEmail(), createConfirmationBaseUrl(confirmationToken));
    }

    @Override
    @RequiresKollappUserRole
    public KollappUser updateKollappUser(@Nullable String username, @Nullable String email) {
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
        KollappUserUpdatedEvent updatedEvent =
                new KollappUserUpdatedEvent(this, kollappUser.getUsername(), kollappUser.getId());
        kollappUserPublisher.publishUserUpdatedEvent(updatedEvent);
        return kollappUser;
    }

    @Override
    @RequiresKollappUserRole
    public void deleteKollappUser() {
        KollappUser kollappUser = getLoggedInKollappUser();
        kollappUserPublisher.publishUserDeletedEvent(new KollappUserDeletedEvent(this, kollappUser.getId()));
        SecurityContextHolder.getContext().setAuthentication(null);
        userRepo.deleteById(kollappUser.getId());
    }

    @Override
    public KollappUser findById(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new KollappUserNotFoundException(messageSource));
    }

    private String createConfirmationBaseUrl(String token) {
        Map<String, String> params = Map.of("confirmationToken", token);
        return urlBuilderUtil.buildServerUrl("/api/public/user/confirmation", params);
    }

    private String createResetPasswordBaseUrl(String token) {
        Map<String, String> params = Map.of("resetPasswordToken", token);
        return urlBuilderUtil.buildClientUrl(ClientPlatform.WEB, "/auth/reset-password/confirmation", params);
    }

    private KollappUser getKollappUserByEmail(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new EmailNotFoundException(messageSource));
    }
}
