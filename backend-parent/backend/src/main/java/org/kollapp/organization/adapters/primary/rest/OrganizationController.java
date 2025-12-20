package org.kollapp.organization.adapters.primary.rest;

import java.util.List;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.core.validation.ValidId;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PersonOfOrganizationPatchRoleRequestTO;
import org.kollapp.organization.adapters.primary.rest.mapper.OrganizationMapper;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.service.OrganizationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/organization")
@Slf4j
@PrimaryAdapter
@Validated
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private MessageSource messageSource;

    @GetMapping
    @Operation(
            summary = "Get the organizations of the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<List<OrganizationMinifiedTO>>> getOrganizationOfLoggedInUser() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        List<OrganizationMinifiedTO> organizationMinifiedTOs = organizations.stream()
                .map(o -> organizationMapper.organizationToOrganizationMinifiedTO(o))
                .toList();
        return ResponseEntity.ok(
                new DataResponseTO<>(organizationMinifiedTOs, "success.organization.get", messageSource));
    }

    @GetMapping("/{organization-id}")
    @Operation(
            summary = "Get an organization by its id",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> getOrganizationById(
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization = organizationService.getOrganizationById(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, "success.organization.get", messageSource));
    }

    @GetMapping("/invitation/{invitation-code}")
    @Operation(
            summary = "Get the basic information of the organization by its invitation code",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationMinifiedTO>> getOrganizationBaseInformationByInvitationCode(
            @PathVariable("invitation-code") String invitationCode) {
        Organization organization = organizationService.getOrganizationByInvitationCode(invitationCode);
        OrganizationMinifiedTO organizationMinifiedTO =
                organizationMapper.organizationToOrganizationMinifiedTO(organization);
        return ResponseEntity.ok(
                new DataResponseTO<>(organizationMinifiedTO, "success.organization.get", messageSource));
    }

    @PatchMapping("/{organization-id}/person/{person-id}/approve")
    @Operation(
            summary = "Approve a request of a new member to join the organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> approveMemberRequest(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("person-id") @ValidId long personId) {
        Organization organization = organizationService.approveNewMemberRequest(organizationId, personId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(
                new DataResponseTO<>(organizationTO, "success.organization.member.approve", messageSource));
    }

    @PostMapping("/invitation/{invitation-code}")
    @Operation(
            summary = "Enter an organization based on its invitation code.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> enterOrganizationBasedOnInvitationCode(
            @PathVariable("invitation-code") String invitationCode) {
        organizationService.enterOrganizationByInvitationCode(invitationCode);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.applied", messageSource));
    }

    @PatchMapping("/{organization-id}/person/{person-id}/grant-role")
    @Operation(
            summary = "Grant a certain role to a person of an organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> grantRoleToPersonOfOrganization(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("person-id") @ValidId long personId,
            @RequestBody PersonOfOrganizationPatchRoleRequestTO patchRoleRequestTO) {
        OrganizationRole targetRole =
                OrganizationRole.valueOf(patchRoleRequestTO.getRole().name());
        Organization organization =
                organizationService.grantRoleToPersonOfOrganization(organizationId, personId, targetRole);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(
                new DataResponseTO<>(organizationTO, "success.organization.role.grant", messageSource));
    }

    @PatchMapping("/{organization-id}/invitation-code")
    @Operation(
            summary = "Renew the invitation code of the organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> updateOrganizationInvitationCode(
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization = organizationService.generateNewOrganizationInvitationCode(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(
                new DataResponseTO<>(organizationTO, "success.organization.invitation.update", messageSource));
    }

    @PostMapping
    @Operation(
            summary = "Create an organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> createOrganization(
            @Valid @RequestBody OrganizationCreationRequestTO creationRequestTO) {
        Organization organization = organizationMapper.organizationCreationRequestToOrganization(creationRequestTO);
        Organization persistedOrganization = organizationService.createOrganization(organization);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(persistedOrganization);
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, "success.organization.create", messageSource));
    }

    @PutMapping("/{organization-id}")
    @Operation(
            summary = "Update an organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> updateOrganization(
            @Valid @RequestBody OrganizationUpdateRequestTO updateRequestTO,
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization = organizationMapper.organizationUpdateRequestToOrganization(updateRequestTO);
        Organization updatedOrganization = organizationService.updateOrganization(organization, organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(updatedOrganization);
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, "success.organization.update", messageSource));
    }

    @DeleteMapping("/{organization-id}")
    @Operation(
            summary = "Leave the organization, deletion if last manager",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> leaveOrganization(
            @PathVariable("organization-id") @ValidId long organizationId) {
        organizationService.leaveOrganization(organizationId);
        return ResponseEntity.ok(new MessageResponseTO("success.organization.delete", messageSource));
    }

    @DeleteMapping("/{organization-id}/person/{person-of-organization-id}")
    @Operation(
            summary = "Remove user from the organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> removeUserFromOrganization(
            @PathVariable("person-of-organization-id") @ValidId long personOfOrganizationId,
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization =
                organizationService.deleteUserFromOrganization(personOfOrganizationId, organizationId);
        OrganizationTO orgaTo = organizationMapper.organizationToOrganizationTO(organization);
        return ResponseEntity.ok(new DataResponseTO<>(orgaTo, "success.organization.user.delete", messageSource));
    }
}
