package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.*;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/organization")
@Transactional
@Slf4j
@PrimaryAdapter
public class UnauthorizedOrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @GetMapping("/confirmation")
    public ResponseEntity<ResponseTO> confirmOrganization(@RequestParam("confirmationToken") String confirmationToken) {
        try {
            organizationService.activateOrganization(confirmationToken);
            return ResponseEntity.ok(new MessageResponseTO("success.confirmation"));
        } catch (Exception e) {
            log.error("Error while confirming organization:", e.getLocalizedMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseTO> forgotPassword(@RequestBody ForgotPasswordRequestTO forgotPasswordTo) {
        try {
            organizationService.resetPassword(forgotPasswordTo.getEmail());
            return ResponseEntity.ok(new MessageResponseTO("success.email.reset-password"));
        } catch (Exception e) {
            log.error("Error while resetting password:", e.getLocalizedMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseTO> registerOrganization(
            @Valid @RequestBody OrganizationSignupRequest signUpRequest) {
        organizationService.register(
                signUpRequest.getUsername(),
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.registered"));
    }
}
