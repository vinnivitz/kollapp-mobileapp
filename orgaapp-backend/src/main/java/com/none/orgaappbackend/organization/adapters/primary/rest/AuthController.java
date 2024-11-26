package com.none.orgaappbackend.organization.adapters.primary.rest;

import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginRequest;
import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginResponse;
import com.none.orgaappbackend.organization.application.service.AuthService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/auth")
@Transactional
@Slf4j
@PrimaryAdapter
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateOrganization(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }
}
