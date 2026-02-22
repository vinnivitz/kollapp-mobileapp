package org.kollapp.organization.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.AllArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetCreateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingCreateUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingTO;
import org.kollapp.organization.adapters.primary.rest.mapper.ActivityMapper;
import org.kollapp.organization.adapters.primary.rest.mapper.PostingMapper;
import org.kollapp.organization.application.model.ActivityBudget;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.service.BudgetAccountService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@PrimaryAdapter
@RequestMapping("/api/organization")
@AllArgsConstructor
public class BudgetAccountController {

    private final PostingMapper postingMapper;

    private final BudgetAccountService budgetAccountService;

    private final MessageUtil messageUtil;
    private final ActivityMapper activityMapper;

    @PostMapping("/{organization-id}/posting")
    @Operation(
            summary = "Add a new posting to an organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> addOrganizationPosting(
            @PathVariable("organization-id") long organizationId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        OrganizationPosting postingToBeAdded =
                postingMapper.mapPostingTOToOrganizationPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addOrganizationPosting(organizationId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        String message = messageUtil.getMessage("success.posting.create");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @PutMapping("/{organization-id}/posting/{posting-id}")
    @Operation(
            summary = "Edit an existing organization posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> editOrganizationPosting(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("posting-id") long postingId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        OrganizationPosting postingToBeEdited = postingMapper.mapPostingTOToOrganizationPosting(postingUpdateRequestTO);
        Posting editedPosting =
                budgetAccountService.editOrganizationPosting(organizationId, postingId, postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        String message = messageUtil.getMessage("success.posting.update");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @DeleteMapping("/{organization-id}/posting/{posting-id}")
    @Operation(
            summary = "Delete an existing organization posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteOrganizationPosting(
            @PathVariable("organization-id") long organizationId, @PathVariable("posting-id") long postingId) {
        budgetAccountService.deleteOrganizationPosting(organizationId, postingId);
        String message = messageUtil.getMessage("success.posting.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }

    @PatchMapping("/{organization-id}/posting/{posting-id}")
    @Operation(
            summary = "Transfer an existing organization posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> transferOrganizationPosting(
            @PathVariable("organization-id") long organizationId, @PathVariable("posting-id") long postingId) {
        Posting transferedPosting = budgetAccountService.transferOrganizationPosting(organizationId, postingId);
        PostingTO postingTO = postingMapper.mapPostingToPostingTO(transferedPosting);
        String message = messageUtil.getMessage("success.posting.transfer");
        return ResponseEntity.ok(new DataResponseTO<>(postingTO, message));
    }

    @PostMapping("/{organization-id}/activity/{activity-id}/posting")
    @Operation(
            summary = "Add a new posting to an activity.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> addActivityPosting(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        ActivityPosting postingToBeAdded = postingMapper.mapPostingTOToActivityPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addActivityPosting(organizationId, activityId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        String message = messageUtil.getMessage("success.posting.create");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @PutMapping("/{organization-id}/activity/{activity-id}/posting/{posting-id}")
    @Operation(
            summary = "Edit an existing activity posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> editActivityPosting(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @PathVariable("posting-id") long postingId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        ActivityPosting postingToBeEdited = postingMapper.mapPostingTOToActivityPosting(postingUpdateRequestTO);
        Posting editedPosting =
                budgetAccountService.editActivityPosting(organizationId, activityId, postingId, postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        String message = messageUtil.getMessage("success.posting.update");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @DeleteMapping("/{organization-id}/activity/{activity-id}/posting/{posting-id}")
    @Operation(
            summary = "Delete an existing activity posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityPosting(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @PathVariable("posting-id") long postingId) {
        budgetAccountService.deleteActivityPosting(organizationId, activityId, postingId);
        String message = messageUtil.getMessage("success.posting.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }

    @PatchMapping("/{organization-id}/activity/{activity-id}/posting/{posting-id}")
    @Operation(
            summary = "Transfer an existing activity posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> transferOrganizationPosting(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @PathVariable("posting-id") long postingId) {
        Posting transferedPosting = budgetAccountService.transferActivityPosting(organizationId, activityId, postingId);
        PostingTO postingTO = postingMapper.mapPostingToPostingTO(transferedPosting);
        String message = messageUtil.getMessage("success.posting.transfer");
        return ResponseEntity.ok(new DataResponseTO<>(postingTO, message));
    }

    @PostMapping("/{organization-id}/activity/{activity-id}/budget")
    @Operation(
            summary = "Add an organization category budget mapping for an activity.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityBudgetTO>> addActivityBudget(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @RequestBody @Valid ActivityBudgetCreateRequestTO activityBudgetTO) {
        ActivityBudget activityBudgetMappingToBeCreated =
                postingMapper.mapActivityBudgetCreationRequestTOToActivityBudget(activityBudgetTO);
        ActivityBudget persistedActivityBudgetMapping = budgetAccountService.addActivityBudgetMapping(
                organizationId, activityId, activityBudgetMappingToBeCreated);
        ActivityBudgetTO response = postingMapper.mapActivityBudgetToActivityBudgetTO(persistedActivityBudgetMapping);
        String message = messageUtil.getMessage("success.activityBudget.update");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @PutMapping("/{organization-id}/activity/{activity-id}/budget/{activity-budget-id}/")
    @Operation(
            summary = "Edit an organization category budget mapping for an activity.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityBudgetTO>> editActivityBudget(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @PathVariable("activity-budget-id") long activityBudgetId,
            @RequestBody @Valid ActivityBudgetUpdateRequestTO activityBudgetTO) {
        ActivityBudget activityBudgetMappingToBeEdited =
                postingMapper.mapActivityBudgetUpdateRequestTOToActivityBudget(activityBudgetTO);
        ActivityBudget updatedBudgetMapping = budgetAccountService.editActivityBudgetMapping(
                organizationId, activityId, activityBudgetId, activityBudgetMappingToBeEdited);
        ActivityBudgetTO response = postingMapper.mapActivityBudgetToActivityBudgetTO(updatedBudgetMapping);
        String message = messageUtil.getMessage("success.activityBudget.create");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @DeleteMapping("/{organization-id}/activity/{activity-id}/budget/{activity-budget-id}/")
    @Operation(
            summary = "Delete an organization category budget mapping for an activity.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityBudget(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @PathVariable("activity-budget-id") long activityBudgetId) {
        budgetAccountService.deleteActivityBudgetMapping(organizationId, activityId, activityBudgetId);
        String message = messageUtil.getMessage("success.activityBudget.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }
}
