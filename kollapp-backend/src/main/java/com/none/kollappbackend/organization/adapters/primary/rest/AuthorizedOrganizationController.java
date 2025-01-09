package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.PasswordChangeRequestTO;
import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping
    @Operation(summary = "Get the organization details", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<ResponseTO> getOrganization() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OrganizationDetails organizationDetails = (OrganizationDetails) authentication.getPrincipal();
        return ResponseEntity.ok(new DataResponseTO(organizationDetails, "success.organization.get-data", messageSource));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change the password", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<ResponseTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo) {
        organizationService.changePassword(changeRequestTo.getCurrentPassword(), changeRequestTo.getNewPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.changed", messageSource));
    }
}
