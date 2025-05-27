package org.kollappbackend.accounting.adapters.primary.rest;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.application.exception.BudgetAccountDoesNotContainPostingException;
import org.kollappbackend.accounting.application.exception.BudgetAccountDoesNotExistException;
import org.kollappbackend.accounting.application.exception.OrganizationHasNoBudgetAccount;
import org.kollappbackend.accounting.application.exception.PostingDoesNotExistException;
import org.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@PrimaryAdapter
@ControllerAdvice(basePackages = {"org.kollappbackend.accounting"})
public class AccountExceptionHandler {
    @ExceptionHandler({BudgetAccountDoesNotExistException.class, OrganizationHasNoBudgetAccount.class,
    PostingDoesNotExistException.class, BudgetAccountDoesNotContainPostingException.class})
    public ResponseEntity<ResponseTO> handleOrganizationNotFound(Exception ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }
}
