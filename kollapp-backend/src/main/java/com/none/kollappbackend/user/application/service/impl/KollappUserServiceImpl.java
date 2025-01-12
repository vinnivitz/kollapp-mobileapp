package com.none.kollappbackend.user.application.service.impl;

import com.none.kollappbackend.user.application.exception.EmailExistsException;
import com.none.kollappbackend.user.application.exception.EmailIsAlreadyConfirmedException;
import com.none.kollappbackend.user.application.exception.EmailNotFoundException;
import com.none.kollappbackend.user.application.exception.IncorrectPasswordException;
import com.none.kollappbackend.user.application.exception.InvalidConfirmationLinkException;
import com.none.kollappbackend.user.application.exception.UsernameExistsException;
import com.none.kollappbackend.user.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.user.application.model.ERole;
import com.none.kollappbackend.user.application.model.KollappUser;
import com.none.kollappbackend.user.application.model.KollappUserDetails;
import com.none.kollappbackend.user.application.repository.KollappUserRepository;
import com.none.kollappbackend.user.application.service.KollappUserService;
import com.none.kollappbackend.core.util.JwtUtil;
import com.none.kollappbackend.core.util.UrlBuilderUtil;

import com.none.kollappbackend.core.config.ClientPlatform;
import com.none.kollappbackend.user.application.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
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
    PasswordEncoder encoder;

    public KollappUser getKollappUserByUsername(String username) {
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

    public KollappUser getLoggedInKollappUser() {
        String username = ((KollappUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(messageSource));
    }

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
    public void register(String username, String email, String password, String name, String surname, List<ERole> roles) {
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
                .name(name)
                .surname(surname)
                .isActivated(false)
                .password(encodedPassword).roles(roles).build();
        userRepo.save(kollappUser);
        String confirmationToken = jwtUtil.generateConfirmationToken(username);
        emailService.sendConfirmationMail(kollappUser.getEmail(), createConfirmationBaseUrl(confirmationToken));
    }

    @Override
    public KollappUser updateKollappUser(KollappUser updatedUserData) {
        KollappUser kollappUser = getLoggedInKollappUser();
        kollappUser.setName(updatedUserData.getName());
        kollappUser.setSurname(updatedUserData.getSurname());
        kollappUser.setUsername(updatedUserData.getUsername());
        if(!kollappUser.getEmail().equals(updatedUserData.getEmail())){
            kollappUser.setActivated(false);
            kollappUser.setEmail(updatedUserData.getEmail());
            String confirmationToken = jwtUtil.generateConfirmationToken(updatedUserData.getUsername());
            String confirmationBaseUrl = createConfirmationBaseUrl(confirmationToken);
            emailService.sendConfirmationMail(kollappUser.getEmail(), confirmationBaseUrl);
        }
        return kollappUser;
    }

    @Override
    public void deleteKollappUser() {
        KollappUser kollappUser = getLoggedInKollappUser();
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
