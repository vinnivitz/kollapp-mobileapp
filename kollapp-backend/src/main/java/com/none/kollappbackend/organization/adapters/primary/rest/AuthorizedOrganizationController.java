package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.PasswordChangeRequestTO;
import com.none.kollappbackend.organization.application.exception.IncorrectPasswordException;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organization")
@Transactional
@Slf4j
@PrimaryAdapter
public class AuthorizedOrganizationController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private OrganizationService organizationService;

    @PostMapping("/change-password")
    @Operation(summary = "Change the password", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<ResponseTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo) {
        try {
            organizationService.changePassword(changeRequestTo.getOldPassword(), changeRequestTo.getNewPassword());
            return ResponseEntity.ok(new MessageResponseTO(messageSource, "success.password.changed"));
        } catch (Exception e) {
            log.error("Error while changing password:" + e.getMessage());
            if (e instanceof IncorrectPasswordException) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ValidationFailureResponseTO("error.password.incorrect", "oldPassword"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseTO(e.getMessage()));
        }
    }
}
