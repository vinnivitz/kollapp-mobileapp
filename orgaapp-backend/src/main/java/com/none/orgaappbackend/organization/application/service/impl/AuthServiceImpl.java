package com.none.orgaappbackend.organization.application.service.impl;

import com.none.orgaappbackend.organization.application.exception.EmailIsNotConfirmedException;
import com.none.orgaappbackend.organization.application.model.AuthenticatedOrganization;
import com.none.orgaappbackend.organization.application.model.OrganizationDetails;
import com.none.orgaappbackend.organization.application.service.AuthService;
import com.none.orgaappbackend.organization.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthenticatedOrganization authenticate(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = JwtUtil.generateExpirationDate();
        String jwt = JwtUtil.generateJwtToken(authentication, expirationDate);
        OrganizationDetails userDetails = (OrganizationDetails) authentication.getPrincipal();
        if(!userDetails.isActivated()){
            throw new EmailIsNotConfirmedException();
        }
        return AuthenticatedOrganization.builder()
                .token(jwt)
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .name(userDetails.getName())
                .loggedInUntil(expirationDate.getTime())
                .build();
    }
}
