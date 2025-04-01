package org.kollappbackend.user.adapters.rest;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.adapters.rest.model.LoginRequestTO;
import org.kollappbackend.user.application.model.AuthToken;
import org.kollappbackend.user.application.model.AuthenticatedKollappUser;
import org.kollappbackend.user.application.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/auth")
@Slf4j
@PrimaryAdapter
public class AuthController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    @Operation(summary = "Sign in a kollapp user")
    public ResponseEntity<ResponseTO> authenticateKollappUser(@Valid @RequestBody LoginRequestTO loginRequestTO) {
        AuthenticatedKollappUser authenticatedKollappUser =
                authService.authenticate(loginRequestTO.getUsername(), loginRequestTO.getPassword());
        return ResponseEntity.ok(new DataResponseTO(authenticatedKollappUser, "success.user.signin", messageSource));
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh the access token")
    public ResponseEntity<ResponseTO> refreshAccessToken(@RequestParam("token") String refreshToken) {
        String accessToken = authService.refresh(refreshToken);
        return ResponseEntity.ok(
                new DataResponseTO(new AuthToken(accessToken), "success.user.refresh-token", messageSource));
    }
}
