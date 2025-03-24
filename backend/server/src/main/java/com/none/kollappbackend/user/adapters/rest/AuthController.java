package com.none.kollappbackend.user.adapters.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.user.adapters.rest.model.LoginRequestTO;
import com.none.kollappbackend.user.application.model.AuthToken;
import com.none.kollappbackend.user.application.model.AuthenticatedKollappUser;
import com.none.kollappbackend.user.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
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
