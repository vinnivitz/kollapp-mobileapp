package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.core.config.properties.ApplicationProperties;
import com.none.kollappbackend.organization.application.exception.EmailIsAlreadyConfirmedException;
import com.none.kollappbackend.organization.application.exception.IncorrectPasswordException;
import com.none.kollappbackend.organization.application.exception.InvalidConfirmationLinkException;
import com.none.kollappbackend.organization.application.exception.UsernameExistsException;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.util.JwtUtil;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OrganizationRepository orgaRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    public Organization getOrganizationByUsername(String username) {
        return orgaRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException());
    }

    public Organization getLoggedInOrganization() {
        String username = ((OrganizationDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        return orgaRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException());
    }

    public Optional<Organization> getOrganizationOptionalByEmail(String email) {
        return this.orgaRepo.findByEmail(email);
    }

    @Override
    public void activateOrganization(String confirmationToken) {
        if (!jwtUtil.validateJwtTokenForAuthentication(confirmationToken)) {
            throw new InvalidConfirmationLinkException();
        }
        long userId = Long.parseLong(jwtUtil.getSubjectFromJwtToken(confirmationToken));
        Organization organization = orgaRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.organization.not-found"));
        if (organization.isActivated()) {
            throw new EmailIsAlreadyConfirmedException();
        }
        organization.setActivated(true);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        String usernameOfLoggedInUser = getLoggedInOrganization().getUsername();
        Organization organization = getOrganizationByUsername(usernameOfLoggedInUser);
        boolean oldPasswordIsCorrect = encoder.matches(oldPassword, organization.getPassword());
        if (!oldPasswordIsCorrect) {
            throw new IncorrectPasswordException();
        }
        organization.setPassword(encoder.encode(newPassword));
    }

    @Override
    public void resetPassword(String email) {
        Optional<Organization> orgaOpt = getOrganizationOptionalByEmail(email);
        if (orgaOpt.isPresent()) {
            Organization organization = orgaOpt.get();
            String tempPassword = RandomStringUtils.randomAlphanumeric(8);
            String tempPasswordEncoding = encoder.encode(tempPassword);
            emailService.sendForgotPasswordMail(organization.getEmail(), tempPassword);
            organization.setPassword(tempPasswordEncoding);
        }
    }

    @Override
    public void register(String username, String name, String email, String password) {
        String confirmationBaseUrl = "http" + (Boolean.parseBoolean(applicationProperties.getProduction()) ? "s" : "")
                + "://" + applicationProperties.getHost()
                + "/api/public/organization/confirmation";
        assert isUsernameFree(username);
        String encodedPassword = encoder.encode(password);
        Organization organization = Organization.builder().username(username).name(name).email(email)
                .password(encodedPassword).build();
        orgaRepo.save(organization);
        String confirmationToken = jwtUtil.generateJwtTokenForConfirmation(organization);
        String confirmationUrl = confirmationBaseUrl + "?confirmationToken=" + confirmationToken;
        emailService.sendConfirmationMail(organization.getEmail(), confirmationUrl);
    }

    public boolean isUsernameFree(String username) {
        if (orgaRepo.existsByUsername(username)) {
            throw new UsernameExistsException();
        }
        return true;
    }
}
