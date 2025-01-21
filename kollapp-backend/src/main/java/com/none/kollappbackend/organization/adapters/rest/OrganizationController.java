package com.none.kollappbackend.organization.adapters.rest;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.rest.mapper.OrganizationMapper;
import com.none.kollappbackend.organization.adapters.rest.model.OrganizationCreationRequestTO;
import com.none.kollappbackend.organization.adapters.rest.model.OrganizationTO;
import com.none.kollappbackend.organization.adapters.rest.model.OrganizationUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.model.RequiresManagerRole;
import com.none.kollappbackend.user.application.model.RequiresMemberRole;
import com.none.kollappbackend.user.application.service.KollappUserService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/organization")
@Slf4j
@PrimaryAdapter
public class OrganizationController {
    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private MessageSource messageSource;

    @GetMapping
    @Operation(summary = "Get the organization of the logged in user", security = {
            @SecurityRequirement(name = "bearer-key") })
    @RequiresMemberRole
    public ResponseEntity<ResponseTO> getOrganization() {
        Organization organization = organizationService.getOrganizationByLoggedInUser();
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.get", messageSource));
    }

    @PostMapping
    @Operation(summary = "Create an organization", security = {
        @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> createOrganization(@Valid @RequestBody OrganizationCreationRequestTO creationRequestTO) {
        long id = organizationService.createOrganization(creationRequestTO.getName());
        kollappUserService.updateKollappUserOrganizationId(id);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.create", messageSource));
    }

    @PutMapping
    @Operation(summary = "Update an organization", security = {
        @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> updateOrganization(@Valid @RequestBody OrganizationUpdateRequestTO updateRequestTO) {
        organizationService.updateOrganization(updateRequestTO.getName());
        return ResponseEntity.ok(new MessageResponseTO("success.organization.update", messageSource));
    }

    @DeleteMapping
    @Operation(summary = "Delete the organization of the logged in user", security = {
        @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> deleteOrganization() {
        Organization organization = organizationService.getOrganizationByLoggedInUser();
        organizationService.deleteOrganization(organization.getId());
        return ResponseEntity.ok(new MessageResponseTO("success.organization.delete", messageSource));
    }
}
