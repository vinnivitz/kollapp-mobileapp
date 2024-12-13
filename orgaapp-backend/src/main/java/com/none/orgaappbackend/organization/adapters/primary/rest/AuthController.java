package com.none.orgaappbackend.organization.adapters.primary.rest;

import com.none.orgaappbackend.core.adapters.primary.model.DataResponseTO;
import com.none.orgaappbackend.core.adapters.primary.model.MessageResponseTO;
import com.none.orgaappbackend.core.adapters.primary.model.ResponseTO;
import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginRequestTO;
import com.none.orgaappbackend.organization.application.model.AuthenticatedOrganization;
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
    public ResponseEntity<DataResponseTO> authenticateOrganization(@Valid @RequestBody LoginRequestTO loginRequestTO) {
        AuthenticatedOrganization authenticatedOrganization = authService.authenticate(loginRequestTO.getUsername(), loginRequestTO.getPassword());
        DataResponseTO response = new DataResponseTO(authenticatedOrganization);
        return ResponseEntity.ok(response);
    }
}
