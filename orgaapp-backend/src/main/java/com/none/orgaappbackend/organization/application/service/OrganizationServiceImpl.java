package com.none.orgaappbackend.organization.application.service;

import com.none.orgaappbackend.core.exception.EmailIsAlreadyConfirmedException;
import com.none.orgaappbackend.core.exception.IncorrectPasswordException;
import com.none.orgaappbackend.core.exception.InvalidConfirmationLinkException;
import com.none.orgaappbackend.core.exception.UsernameIsAlreadyInUseException;
import com.none.orgaappbackend.organization.application.OrganizationRepository;
import com.none.orgaappbackend.organization.application.OrganizationService;
import com.none.orgaappbackend.organization.application.model.Organization;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.none.orgaappbackend.organization.util.JwtUtil;

import java.util.Optional;

@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private OrganizationRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    public Organization getOrganizationByUsername(String username){
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Der Nutzername wurde nicht gefunden!"));
    }

    public Organization getLoggedInOrganization(){
        String username = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Der Nutzername existiert nicht!"));
    }

    public Optional<Organization> getOrganizationOptionalByEmail(String email){
        return this.userRepo.findByEmail(email);
    }

    @Override
    public void activateOrganization(String confirmationToken) {
        if(!jwtUtil.validateJwtToken(confirmationToken)){
            throw new InvalidConfirmationLinkException();
        }
        long userId = Long.parseLong(jwtUtil.getSubjectFromJwtToken(confirmationToken));
        Organization organization = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("Der Nutzer existiert nicht!"));
        if(organization.isActivated()){
            throw new EmailIsAlreadyConfirmedException();
        }
        organization.setActivated(true);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        String usernameOfLoggedInUser = getLoggedInOrganization().getUsername();
        Organization organization = getOrganizationByUsername(usernameOfLoggedInUser);
        boolean oldPasswordIsCorrect = encoder.matches(oldPassword, organization.getPassword());
        if(!oldPasswordIsCorrect){
            throw new IncorrectPasswordException();
        }
        organization.setPassword(encoder.encode(newPassword));
    }

    @Override
    public void resetPassword(String email) {
        Optional<Organization> orgaOpt = getOrganizationOptionalByEmail(email);
        if(orgaOpt.isPresent()){
            Organization organization = orgaOpt.get();
            String tempPassword = RandomStringUtils.randomAlphanumeric(8);
            String tempPasswordEncoding = encoder.encode(tempPassword);
            emailService.sendForgotPasswordMail(organization.getEmail(), tempPassword);
            organization.setPassword(tempPasswordEncoding);
        }
    }

    public boolean isUsernameFree(String username){
        if (userRepo.existsByUsername(username)) {
            throw new UsernameIsAlreadyInUseException();
        }
        return true;
    }
}
