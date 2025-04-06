package org.kollappbackend.organization.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.organization.adapters.primary.rest.mapper.OrganizationMapper;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationCreationRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationUpdateRequestTO;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.RequiresKollappUserRole;
import org.kollappbackend.user.application.model.RequiresManagerOrMemberRole;
import org.kollappbackend.user.application.model.RequiresManagerRole;
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

import java.util.List;
import java.util.stream.Collectors;

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
    @Operation(summary = "Get the organizations of the logged in user", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresKollappUserRole
    public ResponseEntity<ResponseTO> getOrganizationOfLoggedInUser() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        List<OrganizationTO> organizationTOs = organizations.stream()
                .map(o -> organizationMapper.organizationToOrganizationTO(o))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new DataResponseTO(organizationTOs, "success.organization.get", messageSource));
    }

    @PostMapping
    @Operation(summary = "Create an organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresKollappUserRole
    public ResponseEntity<ResponseTO> createOrganization(
            @Valid @RequestBody OrganizationCreationRequestTO creationRequestTO) {
        Organization organization = organizationMapper.organizationCreationRequestToOrganization(creationRequestTO);
        Organization persistedOrganization = organizationService.createOrganization(organization);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(persistedOrganization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.create", messageSource));
    }

    @PutMapping("/{organization-id}")
    @Operation(summary = "Update an organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> updateOrganization(
            @Valid @RequestBody OrganizationUpdateRequestTO updateRequestTO,
            @PathVariable("organization-id") long organizationId) {
        Organization organization = organizationMapper.organizationUpdateRequestToOrganization(updateRequestTO);
        Organization updatedOrganization = organizationService.updateOrganization(organization, organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(updatedOrganization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.update", messageSource));
    }

    @DeleteMapping("/{organization-id}")
    @Operation(summary = "Leave the organization, deletion if last manager", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> leaveOrganization(@PathVariable("organization-id") long organizationId) {
        organizationService.leaveOrganization(organizationId);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.delete", messageSource));
    }

    @DeleteMapping("/{organization-id}/person/{person-of-organization-id}")
    @Operation(summary = "Remove user from the organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> removeUserFromOrganization(
            @PathVariable("person-of-organization-id") long personOfOrganizationId,
            @PathVariable("organization-id") long organizationId) {
        Organization organization = organizationService.deleteUserFromOrganization(personOfOrganizationId, organizationId);
        OrganizationTO orgaTo = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(orgaTo, "success.organization.user.delete", messageSource));
    }
}