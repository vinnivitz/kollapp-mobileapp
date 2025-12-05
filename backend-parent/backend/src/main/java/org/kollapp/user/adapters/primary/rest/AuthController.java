package org.kollapp.user.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.user.adapters.primary.rest.dto.AuthTokensTO;
import org.kollapp.user.adapters.primary.rest.dto.LoginRequestTO;
import org.kollapp.user.adapters.primary.rest.mapper.AuthTokensMapper;
import org.kollapp.user.application.model.AuthToken;
import org.kollapp.user.application.model.AuthTokens;
import org.kollapp.user.application.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/public/auth")
@Slf4j
@PrimaryAdapter
public class AuthController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthTokensMapper authTokensMapper;

    @PostMapping("/signin")
    @Operation(summary = "Sign in a kollapp user")
    public ResponseEntity<DataResponseTO<AuthTokensTO>> authenticateKollappUser(
            @Valid @RequestBody LoginRequestTO loginRequestTO) {
        AuthTokens authenticatedKollappUser =
                authService.authenticate(loginRequestTO.getUsername(), loginRequestTO.getPassword());
        AuthTokensTO tokensTO = authTokensMapper.authTokensToAuthTokensTO(authenticatedKollappUser);
        return ResponseEntity.ok(new DataResponseTO<>(tokensTO, "success.user.signin", messageSource));
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh the access token")
    public ResponseEntity<DataResponseTO<AuthToken>> refreshAccessToken(@RequestParam("token") String refreshToken) {
        String accessToken = authService.refresh(refreshToken);
        return ResponseEntity.ok(
                new DataResponseTO<>(new AuthToken(accessToken), "success.user.refresh-token", messageSource));
    }
}
