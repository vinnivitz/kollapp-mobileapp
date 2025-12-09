package org.kollapp.organization.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.AllArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.core.validation.ValidId;
import org.kollapp.organization.adapters.primary.rest.dto.PostingCreateUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingTO;
import org.kollapp.organization.adapters.primary.rest.mapper.PostingMapper;
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
@Validated
public class BudgetAccountController {

    @Autowired
    private PostingMapper postingMapper;

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/{organization-id}/posting")
    @Operation(
            summary = "Add a new posting to an organization.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> addOrganizationPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        OrganizationPosting postingToBeAdded =
                postingMapper.mapPostingTOToOrganizationPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addOrganizationPosting(organizationId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        return ResponseEntity.ok(new DataResponseTO<>(response, "success.posting.create", messageSource));
    }

    @PutMapping("/{organization-id}/posting/{posting-id}")
    @Operation(
            summary = "Edit an existing organization posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> editOrganizationPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("posting-id") @ValidId long postingId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        OrganizationPosting postingToBeEdited = postingMapper.mapPostingTOToOrganizationPosting(postingUpdateRequestTO);
        Posting editedPosting =
                budgetAccountService.editOrganizationPosting(organizationId, postingId, postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        return ResponseEntity.ok(new DataResponseTO<>(response, "success.posting.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/posting/{posting-id}")
    @Operation(
            summary = "Delete an existing organization posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteOrganizationPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("posting-id") @ValidId long postingId) {
        budgetAccountService.deleteOrganizationPosting(organizationId, postingId);
        return ResponseEntity.ok(new MessageResponseTO("success.posting.delete", messageSource));
    }

    @PostMapping("/{organization-id}/{activity-id}/posting")
    @Operation(
            summary = "Add a new posting to an activity.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> addActivityPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("activity-id") @ValidId long activityId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        ActivityPosting postingToBeAdded = postingMapper.mapPostingTOToActivityPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addActivityPosting(organizationId, activityId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        return ResponseEntity.ok(new DataResponseTO<>(response, "success.posting.create", messageSource));
    }

    @PutMapping("/{organization-id}/{activity-id}/posting/{posting-id}")
    @Operation(
            summary = "Edit an existing activity posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<PostingTO>> editActivityPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("activity-id") @ValidId long activityId,
            @PathVariable("posting-id") @ValidId long postingId,
            @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        ActivityPosting postingToBeEdited = postingMapper.mapPostingTOToActivityPosting(postingUpdateRequestTO);
        Posting editedPosting =
                budgetAccountService.editActivityPosting(organizationId, activityId, postingId, postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        return ResponseEntity.ok(new DataResponseTO<>(response, "success.posting.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/{activity-id}/posting/{posting-id}")
    @Operation(
            summary = "Delete an existing activity posting.",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityPosting(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("activity-id") @ValidId long activityId,
            @PathVariable("posting-id") @ValidId long postingId) {
        budgetAccountService.deleteActivityPosting(organizationId, activityId, postingId);
        return ResponseEntity.ok(new MessageResponseTO("success.posting.delete", messageSource));
    }
}
