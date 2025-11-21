package org.kollappbackend.organization.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.organization.adapters.primary.rest.mapper.PostingMapper;
import org.kollappbackend.organization.adapters.primary.rest.model.PostingCreateUpdateRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.model.PostingTO;
import org.kollappbackend.organization.application.model.ActivityPosting;
import org.kollappbackend.organization.application.model.OrganizationPosting;
import org.kollappbackend.organization.application.model.Posting;
import org.kollappbackend.organization.application.service.BudgetAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PrimaryAdapter
@RequestMapping("/api/organization")
@AllArgsConstructor
public class BudgetAccountController {

    @Autowired
    private PostingMapper postingMapper;

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/{organization-id}/posting")
    @Operation(summary = "Add a new posting to an organization.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> addOrganizationPosting(@PathVariable("organization-id") long organizationId,
                                                 @RequestBody @Valid
                                                 PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        OrganizationPosting postingToBeAdded =
                postingMapper.mapPostingTOToOrganizationPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addOrganizationPosting(organizationId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.create", messageSource));
    }

    @PutMapping("/{organization-id}/posting/{posting-id}")
    @Operation(summary = "Edit an existing organization posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> editOrganizationPosting(@PathVariable("organization-id") long organizationId,
                                                  @PathVariable("posting-id") long postingId,
                                                  @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        OrganizationPosting postingToBeEdited = postingMapper.mapPostingTOToOrganizationPosting(postingUpdateRequestTO);
        Posting editedPosting = budgetAccountService.editOrganizationPosting(organizationId,
                postingId, postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/posting/{posting-id}")
    @Operation(summary = "Delete an existing organization posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteOrganizationPosting(
                                                           @PathVariable("organization-id") long organizationId,
                                                           @PathVariable("posting-id") long postingId) {
        budgetAccountService.deleteOrganizationPosting(organizationId, postingId);
        return ResponseEntity.ok(new MessageResponseTO("success.posting.delete", messageSource));
    }

    @PostMapping("/{organization-id}/{activity-id}/posting")
    @Operation(summary = "Add a new posting to an activity.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> addActivityPosting(@PathVariable("organization-id") long organizationId,
                                                 @PathVariable("activity-id") long activityId,
                                                 @RequestBody @Valid
                                                 PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        ActivityPosting postingToBeAdded = postingMapper.mapPostingTOToActivityPosting(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addActivityPosting(organizationId, activityId, postingToBeAdded);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.create", messageSource));
    }

    @PutMapping("/{organization-id}/{activity-id}/posting/{posting-id}")
    @Operation(summary = "Edit an existing activity posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<ResponseTO> editActivityPosting(@PathVariable("organization-id") long organizationId,
                                                          @PathVariable("activity-id") long activityId,
                                                          @PathVariable("posting-id") long postingId,
                                                          @RequestBody @Valid PostingCreateUpdateRequestTO
                                                                      postingUpdateRequestTO) {
        ActivityPosting postingToBeEdited = postingMapper.mapPostingTOToActivityPosting(postingUpdateRequestTO);
        Posting editedPosting = budgetAccountService.editActivityPosting(organizationId, activityId, postingId,
                postingToBeEdited);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/{activity-id}/posting/{posting-id}")
    @Operation(summary = "Delete an existing activity posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityPosting(@PathVariable("organization-id") long organizationId,
                                                           @PathVariable("activity-id") long activityId,
                                                           @PathVariable("posting-id") long postingId) {
        budgetAccountService.deleteActivityPosting(organizationId, activityId, postingId);
        return ResponseEntity.ok(new MessageResponseTO("success.posting.delete", messageSource));
    }
}
