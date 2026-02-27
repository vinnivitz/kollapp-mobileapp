package org.kollapp.organization.adapters.primary.rest;

import java.util.List;

import jakarta.validation.Valid;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
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

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.core.validation.ValidId;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationBudgetCategoryRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PersonOfOrganizationPatchRoleRequestTO;
import org.kollapp.organization.adapters.primary.rest.mapper.OrganizationMapper;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.service.OrganizationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/organization")
@Slf4j
@PrimaryAdapter
@Validated
@AllArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    private final OrganizationMapper organizationMapper;

    private final MessageUtil messageUtil;

    @GetMapping
    @Operation(
            summary = "Get the organizations of the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<List<OrganizationMinifiedTO>>> getOrganizationOfLoggedInUser() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        List<OrganizationMinifiedTO> organizationMinifiedTOs = organizations.stream()
                .map(organizationMapper::organizationToOrganizationMinifiedTO)
                .toList();
        String message = messageUtil.getMessage("success.organization.get");
        return ResponseEntity.ok(new DataResponseTO<>(organizationMinifiedTOs, message));
    }

    @GetMapping("/{organization-id}")
    @Operation(
            summary = "Get an organization by its id",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> getOrganizationById(
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization = organizationService.getOrganizationById(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.get");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
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
        String message = messageUtil.getMessage("success.organization.get");
        return ResponseEntity.ok(new DataResponseTO<>(organizationMinifiedTO, message));
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
        String message = messageUtil.getMessage("success.organization.member.approve");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }

    @PostMapping("/invitation/{invitation-code}")
    @Operation(
            summary = "Enter an organization based on its invitation code.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationMinifiedTO>> enterOrganizationBasedOnInvitationCode(
            @PathVariable("invitation-code") String invitationCode) {
        Organization organization = organizationService.enterOrganizationByInvitationCode(invitationCode);
        OrganizationMinifiedTO organizationMinifiedTO =
                organizationMapper.organizationToOrganizationMinifiedTO(organization);
        String message = messageUtil.getMessage("success.organization.applied");
        return ResponseEntity.ok(new DataResponseTO<>(organizationMinifiedTO, message));
    }

    @PatchMapping("/{organization-id}/person/{person-id}/grant-role")
    @Operation(
            summary = "Grant a certain role to a person of an organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> grantRoleToPersonOfOrganization(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("person-id") long personId,
            @Valid @RequestBody PersonOfOrganizationPatchRoleRequestTO patchRoleRequestTO) {
        OrganizationRole targetRole =
                OrganizationRole.valueOf(patchRoleRequestTO.getRole().name());
        Organization organization =
                organizationService.grantRoleToPersonOfOrganization(organizationId, personId, targetRole);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.role.grant");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }

    @PatchMapping("/{organization-id}/invitation-code")
    @Operation(
            summary = "Renew the invitation code of the organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> updateOrganizationInvitationCode(
            @PathVariable("organization-id") @ValidId long organizationId) {
        Organization organization = organizationService.generateNewOrganizationInvitationCode(organizationId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.invitation.update");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
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
        String message = messageUtil.getMessage("success.organization.create");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
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
        String message = messageUtil.getMessage("success.organization.update");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }

    @DeleteMapping("/{organization-id}")
    @Operation(
            summary = "Leave the organization, deletion if last manager",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> leaveOrganization(
            @PathVariable("organization-id") @ValidId long organizationId) {
        organizationService.leaveOrganization(organizationId);
        String message = messageUtil.getMessage("success.organization.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
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
        String message = messageUtil.getMessage("success.organization.user.delete");
        return ResponseEntity.ok(new DataResponseTO<>(orgaTo, message));
    }

    @PostMapping("/{organization-id}/budget-category")
    @Operation(
            summary = "Creates a new budget category.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> createBudgetCategory(
            @PathVariable("organization-id") long organizationId,
            @Valid @RequestBody OrganizationBudgetCategoryRequestTO budgetCategoryTO) {
        OrganizationBudgetCategory budgetCategory =
                organizationMapper.organizationBudgetCategoryTOToOrganizationBudgetCategory(budgetCategoryTO);
        Organization organization = organizationService.addBudgetCategory(organizationId, budgetCategory);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.budget-category.create");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }

    @PutMapping("/{organization-id}/budget-category/{category-id}")
    @Operation(
            summary = "Updates an existing budget category.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> updateBudgetCategory(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("category-id") long categoryId,
            @Valid @RequestBody OrganizationBudgetCategoryRequestTO budgetCategoryTO) {
        OrganizationBudgetCategory budgetCategory =
                organizationMapper.organizationBudgetCategoryTOToOrganizationBudgetCategory(budgetCategoryTO);
        Organization organization = organizationService.editBudgetCategory(organizationId, categoryId, budgetCategory);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.budget-category.update");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }

    @DeleteMapping("/{organization-id}/budget-category/{category-id}")
    @Operation(
            summary = "Deletes an existing budget category.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<OrganizationTO>> deleteBudgetCategory(
            @PathVariable("organization-id") long organizationId, @PathVariable("category-id") long categoryId) {
        Organization organization = organizationService.deleteBudgetCategory(organizationId, categoryId);
        OrganizationTO organizationTO = organizationMapper.organizationToOrganizationTO(organization);
        String message = messageUtil.getMessage("success.organization.budget-category.delete");
        return ResponseEntity.ok(new DataResponseTO<>(organizationTO, message));
    }
}
