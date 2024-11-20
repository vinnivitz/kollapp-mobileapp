package com.none.orgaappbackend.user.application.service;

import com.none.orgaappbackend.core.exception.EmailIsNotConfirmedException;
import com.none.orgaappbackend.core.util.JwtUtil;
import com.none.orgaappbackend.user.application.AuthService;
import com.none.orgaappbackend.user.adapters.primary.rest.model.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Date;

public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public LoginResponse authenticate(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate();
        String jwt = jwtUtil.generateJwtToken(authentication, expirationDate);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList().getFirst();
        if(!userDetails.isActivated()){
            throw new EmailIsNotConfirmedException();
        }
        return LoginResponse.builder()
                .token(jwt)
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .role(role)
                .surname(userDetails.getSurname())
                .loggedInUntil(expirationDate.getTime())
                .build();
    }
}
