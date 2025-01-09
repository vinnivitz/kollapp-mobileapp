package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.*;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/organization")
@Transactional
@Slf4j
@PrimaryAdapter
public class UnauthorizedOrganizationController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private OrganizationService organizationService;

    @GetMapping("/confirmation")
    public ResponseEntity<ResponseTO> confirmOrganization(@RequestParam("confirmationToken") String confirmationToken) {
        organizationService.activateOrganization(confirmationToken);
        return ResponseEntity.ok(new MessageResponseTO("success.confirmation", messageSource));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestTO forgotPasswordTo) {
        organizationService.forgotPassword(forgotPasswordTo.getEmail());
        return ResponseEntity.ok(new MessageResponseTO("success.email.reset-password", messageSource));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseTO> resetPassword(@RequestParam("token") String token,
            @Valid @RequestBody ResetPasswordRequestTO resetPasswordTo) {
        organizationService.resetPassword(token, resetPasswordTo.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.reset", messageSource));
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseTO> registerOrganization(
            @Valid @RequestBody OrganizationSignupRequest signUpRequest) {
        organizationService.register(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }
}
