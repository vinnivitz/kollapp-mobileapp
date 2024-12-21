package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;
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
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
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
        try {
            AuthenticatedOrganization authenticatedOrganization = authService.authenticate(loginRequestTO.getUsername(),
                    loginRequestTO.getPassword());
            DataResponseTO response = new DataResponseTO(messageSource, authenticatedOrganization,
                    "success.user.signin");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            if (e instanceof BadCredentialsException) {
                return ResponseEntity.badRequest()
                        .body(new ValidationFailureResponseTO(messageSource.getMessage("validation.password.incorrect",
                                null, LocaleContextHolder.getLocale()), "password"));
            }
            log.error("Error while signing user in: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh the access token")
    public ResponseEntity<ResponseTO> refreshAccessToken(@RequestParam("token") String refreshToken) {
        try {
            String accessToken = authService.refresh(refreshToken);
            AccessToken token = new AccessToken(accessToken);
            DataResponseTO dataResponseTO = new DataResponseTO(messageSource, token,
                    "success.user.refresh-token");
            return ResponseEntity.ok(dataResponseTO);
        } catch (Exception e) {
            log.error("Error while refreshing access token: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }
}
