package org.kollapp.user.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.user.adapters.primary.rest.dto.AccessTokenTO;
import org.kollapp.user.adapters.primary.rest.dto.AuthTokensTO;
import org.kollapp.user.adapters.primary.rest.dto.LoginRequestTO;
import org.kollapp.user.adapters.primary.rest.mapper.AccessTokenMapper;
import org.kollapp.user.adapters.primary.rest.mapper.AuthTokensMapper;
import org.kollapp.user.application.model.AccessToken;
import org.kollapp.user.application.model.AuthTokens;
import org.kollapp.user.application.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/public/auth")
@Slf4j
@PrimaryAdapter
public class AuthController {
    @Autowired
    private MessageUtil messageUtil;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthTokensMapper authTokensMapper;

    @Autowired
    private AccessTokenMapper accessTokenMapper;

    @PostMapping("/signin")
    @Operation(summary = "Sign in a kollapp user")
    public ResponseEntity<DataResponseTO<AuthTokensTO>> authenticateKollappUser(
            @Valid @RequestBody LoginRequestTO loginRequestTO) {
        AuthTokens authTokens = authService.authenticate(loginRequestTO.getUsername(), loginRequestTO.getPassword());
        AuthTokensTO tokensTO = authTokensMapper.authTokensToAuthTokensTO(authTokens);
        String message = messageUtil.getMessage("success.user.signin");
        return ResponseEntity.ok(new DataResponseTO<>(tokensTO, message));
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh the access token")
    public ResponseEntity<DataResponseTO<AccessTokenTO>> refreshAccessToken(
            @RequestParam("token") String refreshToken) {
        String accessToken = authService.refresh(refreshToken);
        AccessTokenTO accessTokenTO = accessTokenMapper.accessTokenToAccessTokenTO(new AccessToken(accessToken));
        String message = messageUtil.getMessage("success.user.refresh-token");
        return ResponseEntity.ok(new DataResponseTO<>(accessTokenTO, message));
    }
}
