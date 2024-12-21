package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.*;
import com.none.kollappbackend.organization.application.exception.EmailExistsException;
import com.none.kollappbackend.organization.application.exception.UsernameExistsException;
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
        try {
            organizationService.activateOrganization(confirmationToken);
            return ResponseEntity.ok(new MessageResponseTO(messageSource, "success.confirmation"));
        } catch (Exception e) {
            log.error("Error while confirming organization: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestTO forgotPasswordTo) {
        try {
            organizationService.resetPassword(forgotPasswordTo.getEmail());
            return ResponseEntity.ok(new MessageResponseTO(messageSource, "success.email.reset-password"));
        } catch (Exception e) {
            log.error("Error while resetting password:", e.getLocalizedMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseTO> registerOrganization(
            @Valid @RequestBody OrganizationSignupRequest signUpRequest) {
        try {
            organizationService.register(
                    signUpRequest.getUsername(),
                    signUpRequest.getName(),
                    signUpRequest.getEmail(),
                    signUpRequest.getPassword());
            return ResponseEntity.ok(new MessageResponseTO(messageSource, "success.registration"));
        } catch (Exception e) {
            if (e instanceof UsernameExistsException) {
                return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(e.getMessage(), "username"));
            } else if (e instanceof EmailExistsException) {
                return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(e.getMessage(), "email"));
            }
            log.error("Error while registering organization: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponseTO(e.getMessage()));
        }
    }
}
