package org.kollappbackend.accounting.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.adapters.primary.rest.mapper.BudgetAccountMapper;
import org.kollappbackend.accounting.adapters.primary.rest.mapper.PostingMapper;
import org.kollappbackend.accounting.adapters.primary.rest.model.BudgetAccountTO;
import org.kollappbackend.accounting.adapters.primary.rest.model.PostingCreateUpdateRequestTO;
import org.kollappbackend.accounting.adapters.primary.rest.model.PostingTO;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.kollappbackend.accounting.application.model.Posting;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.application.model.RequiresKollappOrganizationMemberRole;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PrimaryAdapter
@RequestMapping("/api/budget")
@AllArgsConstructor
public class AccountingController {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Autowired
    private PostingMapper postingMapper;

    @Autowired
    private BudgetAccountMapper budgetAccountMapper;

    @Autowired
    private MessageSource messageSource;

    @GetMapping("/account")
    @Operation(summary = "Get the budget account by the organization id.", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresKollappOrganizationMemberRole
    public ResponseEntity<ResponseTO> getBudgetAccountByOrganizationId(
            @RequestParam("organization-id") long organizationId) {
        BudgetAccount budgetAccount = budgetAccountService.getBudgetAccountByOrganizationId(organizationId);
        BudgetAccountTO budgetAccountTO = budgetAccountMapper.mapBudgetAccountToBudgetAccountTO(budgetAccount);
        return ResponseEntity.ok(new DataResponseTO(budgetAccountTO, "success.budgetAccount.get",
                messageSource));
    }

    @PostMapping("/account/{account-id}/posting")
    @Operation(summary = "Add a new posting to a budget account.", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresKollappOrganizationMemberRole
    public ResponseEntity<ResponseTO> addPosting(@PathVariable("account-id") long accountId,
                                                 @RequestBody @Valid
                                                 PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        Posting postingToBeAdded = mapPostingAccordingToActivityId(postingCreateUpdateRequestTO);
        Posting addedPosting = budgetAccountService.addPosting(postingToBeAdded, accountId);
        PostingTO response = postingMapper.mapPostingToPostingTO(addedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.create", messageSource));
    }

    @PutMapping("/account/{account-id}/posting/{posting-id}")
    @Operation(summary = "Edit an existing posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresKollappOrganizationMemberRole
    public ResponseEntity<ResponseTO> editPosting(@PathVariable("account-id") long accountId,
                                                  @PathVariable("posting-id") long postingId,
                                                  @RequestBody @Valid PostingCreateUpdateRequestTO postingUpdateRequestTO) {
        Posting postingToBeEdited = mapPostingAccordingToActivityId(postingUpdateRequestTO);
        Posting editedPosting = budgetAccountService.editPosting(postingToBeEdited, postingId, accountId);
        PostingTO response = postingMapper.mapPostingToPostingTO(editedPosting);
        return ResponseEntity.ok(new DataResponseTO(response, "success.posting.update", messageSource));
    }

    @DeleteMapping("/account/{account-id}/posting/{posting-id}")
    @Operation(summary = "Delete an existing posting.", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresKollappOrganizationMemberRole
    public ResponseEntity<MessageResponseTO> deletePosting(@PathVariable("account-id") long accountId,
                                                           @PathVariable("posting-id") long postingId) {
        budgetAccountService.deletePosting(accountId, postingId);
        return ResponseEntity.ok(new MessageResponseTO("success.posting.delete", messageSource));
    }

    private Posting mapPostingAccordingToActivityId(PostingCreateUpdateRequestTO postingCreateUpdateRequestTO) {
        if (postingCreateUpdateRequestTO.getActivityId() == 0) {
            return postingMapper.mapPostingCreationRequestTOToOrganizationPosting(postingCreateUpdateRequestTO);
        }
        return postingMapper.mapPostingCreationRequestTOToActivityPosting(postingCreateUpdateRequestTO);
    }

}
