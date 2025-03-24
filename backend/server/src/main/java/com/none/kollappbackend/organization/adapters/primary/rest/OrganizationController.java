package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.mapper.OrganizationMapper;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.model.RequiresManagerOrMemberRole;
import com.none.kollappbackend.user.application.model.RequiresManagerRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organization")
@Slf4j
@PrimaryAdapter
public class OrganizationController {
    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private MessageSource messageSource;

    @GetMapping
    @Operation(summary = "Get the organization of the logged in user", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> getOrganizationOfLoggedInUser() {
        Organization organization = organizationService.getOrganizationByLoggedInUser();
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.get", messageSource));
    }

    @PostMapping
    @Operation(summary = "Create an organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> createOrganization(
            @Valid @RequestBody OrganizationCreationRequestTO creationRequestTO) {
        Organization organization = organizationMapper.organizationCreationRequestToOrganization(creationRequestTO);
        Organization persistedOrganization = organizationService.createOrganization(organization);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(persistedOrganization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.create", messageSource));
    }

    @PutMapping
    @Operation(summary = "Update an organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> updateOrganization(
            @Valid @RequestBody OrganizationUpdateRequestTO updateRequestTO) {
        Organization organization = organizationMapper.organizationUpdateRequestToOrganization(updateRequestTO);
        Organization updatedOrganization = organizationService.updateOrganization(organization);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(updatedOrganization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.update", messageSource));
    }

    @DeleteMapping
    @Operation(summary = "Leave the organization, deletion if last manager", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> leaveOrganization() {
        organizationService.leaveOrganization();
        return ResponseEntity.ok(new MessageResponseTO("success.organization.delete", messageSource));
    }

    @DeleteMapping("/person/{person-of-organization-id}")
    @Operation(summary = "Remove user from the organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> removeUserFromOrganization(
            @PathVariable("person-of-organization-id") long personOfOrganizationId) {
        Organization organization = organizationService.deleteUserFromOrganization(personOfOrganizationId);
        OrganizationTO orgaTo = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(orgaTo, "success.organization.user.delete", messageSource));
    }
}
