package org.kollappbackend.accounting.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.adapters.primary.rest.mapper.PostingMapper;
import org.kollappbackend.accounting.adapters.primary.rest.model.PostingTO;
import org.kollappbackend.accounting.application.model.Posting;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.application.model.RequiresManagerOrMemberRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    private MessageSource messageSource;

    @GetMapping("/account/postings")
    @Operation(summary = "Get all postings of a budget account.", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> getPostingsOfBudgetAccount(
            @RequestParam("organization-id") long organizationId) {
        List<Posting> postings = budgetAccountService.getPostingsOfBudgetAccountOfOrganizationId(organizationId);
        List<PostingTO> postingTos = postings.stream().map(postingMapper::mapPostingToPostingTO).toList();
        return ResponseEntity.ok(new DataResponseTO(postingTos, "success.activity.get", messageSource));
    }


}
