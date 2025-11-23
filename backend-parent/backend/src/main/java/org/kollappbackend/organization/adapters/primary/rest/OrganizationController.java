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
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationBaseTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationCreationRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationMinifiedTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationTO;
import org.kollappbackend.organization.adapters.primary.rest.model.OrganizationUpdateRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.model.PersonOfOrganizationPatchRoleRequestTO;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    public ResponseEntity<ResponseTO> getOrganizationOfLoggedInUser() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        List<OrganizationMinifiedTO> organizationBaseTOs = organizations.stream()
                .map(o -> organizationMapper.organizationToOrganizationMinifiedTO(o))
                .toList();
        return ResponseEntity.ok(new DataResponseTO(organizationBaseTOs, "success.organization.get", messageSource));
    }

    @GetMapping("/{organization-id}")
    @Operation(summary = "Get an organization by its id", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> getOrganizationById(@PathVariable("organization-id") long organizationId) {
        Organization organization = organizationService.getOrganizationById(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.get", messageSource));
    }

    @GetMapping("/invitation/{invitation-code}")
    @Operation(summary = "Get the basic information of the organization by its invitation code", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> getOrganizationBaseInformationByInvitationCode(
            @PathVariable("invitation-code") String invitationCode) {
        Organization organization = organizationService.getOrganizationByInvitationCode(invitationCode);
        OrganizationBaseTO organizationBaseTO = organizationMapper.organizationToOrganizationBaseTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationBaseTO, "success.organization.get", messageSource));
    }

    @PostMapping("/invitation/{invitation-code}")
    @Operation(summary = "Enter an organization based on its invitation code.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> enterOrganizationBasedOnInvitationCode(
            @PathVariable("invitation-code") String invitationCode) {
        organizationService.enterOrganizationByInvitationCode(invitationCode);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.applied", messageSource));
    }

    @PatchMapping("/{organization-id}/person/{person-id}/grant-role")
    @Operation(summary = "Grant a certain role to a person of an organization.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> grantRoleToPersonOfOrganization(@PathVariable("organization-id") long organizationId,
                                                                      @PathVariable("person-id") long personId,
                                                                      @RequestBody
                                                                      PersonOfOrganizationPatchRoleRequestTO patchRoleRequestTO) {
        Organization organization = organizationService.grantRoleToPersonOfOrganization(organizationId, personId,
                patchRoleRequestTO.getRole());
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.get", messageSource));
    }

    @PatchMapping("/{organization-id}/invitation-code")
    @Operation(summary = "Renew the invitation code of the organization.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> updateOrganizationInvitationCode(
            @PathVariable("organization-id") long organizationId) {
        Organization organization = organizationService.generateNewOrganizationInvitationCode(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.update", messageSource));
    }

    @PostMapping
    @Operation(summary = "Create an organization", security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> createOrganization(
            @Valid @RequestBody OrganizationCreationRequestTO creationRequestTO) {
        Organization organization = organizationMapper.organizationCreationRequestToOrganization(creationRequestTO);
        Organization persistedOrganization = organizationService.createOrganization(organization);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(persistedOrganization);
        return ResponseEntity.ok(new DataResponseTO(organizationTO, "success.organization.create", messageSource));
    }

    @PutMapping("/{organization-id}")
    @Operation(summary = "Update an organization", security = {@SecurityRequirement(name = "bearer-key")})
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
    public ResponseEntity<ResponseTO> leaveOrganization(@PathVariable("organization-id") long organizationId) {
        organizationService.leaveOrganization(organizationId);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.delete", messageSource));
    }

    @DeleteMapping("/{organization-id}/person/{person-of-organization-id}")
    @Operation(summary = "Remove user from the organization", security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> removeUserFromOrganization(
            @PathVariable("person-of-organization-id") long personOfOrganizationId,
            @PathVariable("organization-id") long organizationId) {
        Organization organization = organizationService.deleteUserFromOrganization(personOfOrganizationId, organizationId);
        OrganizationTO orgaTo = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO(orgaTo, "success.organization.user.delete", messageSource));
    }
}