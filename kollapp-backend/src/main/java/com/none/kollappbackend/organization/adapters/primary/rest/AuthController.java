package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.LoginRequestTO;
import com.none.kollappbackend.organization.application.model.AuthenticatedOrganization;
import com.none.kollappbackend.organization.application.model.AccessToken;
import com.none.kollappbackend.organization.application.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
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

@RestController
@RequestMapping("/api/public/auth")
@Transactional
@Slf4j
@PrimaryAdapter
public class AuthController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    @Operation(summary = "Sign in an organization")
    public ResponseEntity<ResponseTO> authenticateOrganization(@Valid @RequestBody LoginRequestTO loginRequestTO) {
        AuthenticatedOrganization authenticatedOrganization = authService.authenticate(loginRequestTO.getUsername(),
                loginRequestTO.getPassword());
        return ResponseEntity.ok(new DataResponseTO(authenticatedOrganization, "success.user.signin", messageSource));
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh the access token")
    public ResponseEntity<ResponseTO> refreshAccessToken(@RequestParam("token") String refreshToken) {
        String accessToken = authService.refresh(refreshToken);
        AccessToken token = new AccessToken(accessToken);
        return ResponseEntity.ok(new DataResponseTO(token, "success.user.refresh-token", messageSource));
    }
}
