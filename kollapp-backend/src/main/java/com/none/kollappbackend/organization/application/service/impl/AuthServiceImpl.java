package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.core.config.properties.JwtProperties;
import com.none.kollappbackend.organization.application.exception.EmailIsNotConfirmedException;
import com.none.kollappbackend.organization.application.exception.InvalidRefreshTokenException;
import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.organization.application.model.AuthenticatedOrganization;
import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.AuthService;
import com.none.kollappbackend.util.JwtUtil;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
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
    private OrganizationRepository orgaRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedOrganization authenticate(String username, String password) {
        if (!orgaRepo.existsByUsername(username)) {
            throw new UsernameNotFoundException(messageSource);
        }
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationMs());
        OrganizationDetails organizationDetails = (OrganizationDetails) authentication.getPrincipal();
        if (!organizationDetails.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        listProperties(organizationDetails);
        String accessToken = jwtUtil.generateAuthenticationToken(organizationDetails.getId().toString(),
                expirationDate);
        String refreshToken = jwtUtil.generateRefreshToken(organizationDetails.getId().toString());
        return AuthenticatedOrganization.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(organizationDetails.getUsername())
                .email(organizationDetails.getEmail())
                .name(organizationDetails.getName())
                .loggedInUntil(expirationDate.getTime())
                .build();
    }

    public static void listProperties(Object obj) {
        if (obj == null) {
            System.out.println("Object is null");
            return;
        }

        Class<?> clazz = obj.getClass(); // Get the object's class
        Field[] fields = clazz.getDeclaredFields(); // Get all declared fields

        System.out.println("Properties of class: " + clazz.getName());
        for (Field field : fields) {
            field.setAccessible(true); // Access private fields if necessary
            try {
                // Print the field name and value
                System.out.println(field.getName() + " = " + field.get(obj));
            } catch (IllegalAccessException e) {
                System.out.println("Could not access field: " + field.getName());
            }
        }
    }

    @Override
    public String refresh(String token) {
        if (!jwtUtil.validateRefreshToken(token)) {
            throw new InvalidRefreshTokenException(messageSource);
        }

        String organizationId = jwtUtil.getSubjectFromRefreshToken(token);
        var organization = orgaRepo.findById(Long.parseLong(organizationId))
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        if (!organization.isActivated()) {
            throw new EmailIsNotConfirmedException(messageSource);
        }
        Date expirationDate = jwtUtil.generateExpirationDate(jwtProperties.getAuthExpirationMs());
        return jwtUtil.generateAuthenticationToken(organizationId, expirationDate);
    }
}
