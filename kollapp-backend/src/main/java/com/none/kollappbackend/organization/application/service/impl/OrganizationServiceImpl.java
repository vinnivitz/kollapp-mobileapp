package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.organization.application.exception.EmailExistsException;
import com.none.kollappbackend.organization.application.exception.EmailIsAlreadyConfirmedException;
import com.none.kollappbackend.organization.application.exception.EmailNotFoundException;
import com.none.kollappbackend.organization.application.exception.IncorrectPasswordException;
import com.none.kollappbackend.organization.application.exception.InvalidConfirmationLinkException;
import com.none.kollappbackend.organization.application.exception.UsernameExistsException;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.core.util.JwtUtil;
import com.none.kollappbackend.core.util.UrlBuilderUtil;

import jakarta.transaction.Transactional;

import com.none.kollappbackend.organization.application.model.ClientPlatform;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;

@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private UrlBuilderUtil urlBuilderUtil;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OrganizationRepository orgaRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    public Organization getOrganizationByUsername(String username) {
        return orgaRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

    public Organization getLoggedInOrganization() {
        String username = ((OrganizationDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        return orgaRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

    public Organization getOrganizationOptionalByEmail(String email) {
        return this.orgaRepo.findByEmail(email).orElseThrow(() -> new EmailNotFoundException(messageSource));
    }

    @Override
    public void activateOrganization(String confirmationToken) {
        if (!jwtUtil.validateConfirmationToken(confirmationToken)) {
            throw new InvalidConfirmationLinkException(messageSource);
        }
        String username = jwtUtil.getSubjectFromConfirmationToken(confirmationToken);
        Organization organization = orgaRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("error.organization.not-found"));
        if (organization.isActivated()) {
            throw new EmailIsAlreadyConfirmedException(messageSource);
        }
        organization.setActivated(true);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        String usernameOfLoggedInUser = getLoggedInOrganization().getUsername();
        Organization organization = getOrganizationByUsername(usernameOfLoggedInUser);
        boolean oldPasswordIsCorrect = encoder.matches(oldPassword, organization.getPassword());
        if (!oldPasswordIsCorrect) {
            throw new IncorrectPasswordException(messageSource);
        }
        organization.setPassword(encoder.encode(newPassword));
    }

    @Override
    public void forgotPassword(String email) {
        Organization organization = getOrganizationOptionalByEmail(email);
        String token = jwtUtil.generateResetPasswordToken(organization.getUsername());
        emailService.sendForgotPasswordMail(email, createResetPasswordBaseUrl(token));
    }

    @Override
    public void resetPassword(String token, String password) {
        if (!jwtUtil.validateResetPasswordToken(token)) {
            throw new InvalidConfirmationLinkException(messageSource);
        }
        String username = jwtUtil.getSubjectFromResetPasswordToken(token);
        Organization organization = getOrganizationByUsername(username);
        organization.setPassword(encoder.encode(password));
    }

    @Override
    @Transactional
    public void register(String username, String email, String password) {
        if (orgaRepo.existsByUsername(username)) {
            throw new UsernameExistsException(messageSource);
        }
        if (orgaRepo.existsByEmail(email)) {
            throw new EmailExistsException(messageSource);
        }
        String encodedPassword = encoder.encode(password);
        Organization organization = Organization.builder().username(username).email(email)
                .password(encodedPassword).build();
        orgaRepo.save(organization);
        String confirmationToken = jwtUtil.generateConfirmationToken(username);
        emailService.sendConfirmationMail(organization.getEmail(), createConfirmationBaseUrl(confirmationToken));
    }

    private String createConfirmationBaseUrl(String token) {
        Map<String, String> params = Map.of("confirmationToken", token);
        return urlBuilderUtil.buildServerUrl("/api/public/organization/confirmation", params);
    }

    private String createResetPasswordBaseUrl(String token) {
        Map<String, String> params = Map.of("resetPasswordToken", token);
        return urlBuilderUtil.buildClientUrl(ClientPlatform.WEB, "/auth/reset-password/confirmation", params);
    }
}
