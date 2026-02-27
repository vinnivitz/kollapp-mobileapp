package org.kollapp.organization.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ResponseTO;
import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.BudgetCategoryIsNotAssignableException;
import org.kollapp.organization.application.exception.BudgetCategoryNotFoundException;
import org.kollapp.organization.application.exception.BudgetCategoryWithNameExistsException;
import org.kollapp.organization.application.exception.DefaultBudgetCategoryMustNotBeDeletedException;
import org.kollapp.organization.application.exception.DefaultFlagOfBudgetCategoryMustNotBeRevokedException;
import org.kollapp.organization.application.exception.InvalidInvitationCodeException;
import org.kollapp.organization.application.exception.InvalidOrganizationRoleException;
import org.kollapp.organization.application.exception.InvalidPostingTypeException;
import org.kollapp.organization.application.exception.LastManagerException;
import org.kollapp.organization.application.exception.MaxOrganizationsReachedException;
import org.kollapp.organization.application.exception.NoDefaultBudgetCategoryExistsException;
import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonAlreadyHasTargetRoleException;
import org.kollapp.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;
import org.kollapp.organization.application.exception.PostingIsAlreadyTransferredException;
import org.kollapp.organization.application.exception.PostingTransferNotPossibleException;
import org.kollapp.organization.application.exception.SelfActionNotAllowedException;
import org.kollapp.organization.application.exception.UntransferredPostingException;

@ControllerAdvice(basePackages = {"org.kollapp.organization"})
@RestController
@Order(0)
@AllArgsConstructor
public class OrganizationExceptionHandler {

    private final MessageUtil messageUtil;

    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ResponseTO> handleOrganizationNotFound() {
        String message = messageUtil.getMessage("error.organization.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PersonNotRegisteredInOrganizationException.class)
    public ResponseEntity<ResponseTO> handlePersonNotRegisteredInOrganization() {
        String message = messageUtil.getMessage("error.organization.person-not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PersonAlreadyRegisteredInOrganizationException.class)
    public ResponseEntity<ResponseTO> handlePersonAlreadyRegisteredInOrganization() {
        String message = messageUtil.getMessage("error.organization.person-already-registered");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(ActivityNotFoundException.class)
    public ResponseEntity<ResponseTO> handleActivityNotFound() {
        String message = messageUtil.getMessage("error.activity.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PostingDoesNotExistException.class)
    public ResponseEntity<ResponseTO> handlePostingNotFound() {
        String message = messageUtil.getMessage("error.organization.posting.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(InvalidInvitationCodeException.class)
    public ResponseEntity<ResponseTO> handleInvalidInvitationCode() {
        String message = messageUtil.getMessage("error.invitationcode.invalid");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PersonOfOrganizationIsNotApprovedYetException.class)
    public ResponseEntity<ResponseTO> handlePersonOfOrganizationIsNotApprovedYet() {
        String message = messageUtil.getMessage("error.organization.person-not-approved");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(OrganizationAuthorizationException.class)
    public ResponseEntity<ResponseTO> handleOrganizationAuthorizationException() {
        String message = messageUtil.getMessage("error.authorization");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(InvalidOrganizationRoleException.class)
    public ResponseEntity<ResponseTO> handleInvalidOrganizationRole() {
        String message = messageUtil.getMessage("error.invalid-organization-role");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(InvalidPostingTypeException.class)
    public ResponseEntity<ResponseTO> handleInvalidPostingType() {
        String message = messageUtil.getMessage("error.invalid-posting-type");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(LastManagerException.class)
    public ResponseEntity<ResponseTO> handleLastManager() {
        String message = messageUtil.getMessage("error.organization.lastmanager");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PersonAlreadyHasTargetRoleException.class)
    public ResponseEntity<ResponseTO> handlePersonAlreadyHasTargetRole() {
        String message = messageUtil.getMessage("error.organization.person-already-has-target-role");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(MaxOrganizationsReachedException.class)
    public ResponseEntity<ResponseTO> handleMaxOrganizationsReached() {
        String message = messageUtil.getMessage("error.organization.max-organizations-reached");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(SelfActionNotAllowedException.class)
    public ResponseEntity<ResponseTO> handleSelfActionNotAllowed() {
        String message = messageUtil.getMessage("error.organization.self-action-not-allowed");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PostingTransferNotPossibleException.class)
    public ResponseEntity<ResponseTO> handlePostingTransferNotPossibleException() {
        String message = messageUtil.getMessage("error.posting.impossible-transfer");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(UntransferredPostingException.class)
    public ResponseEntity<ResponseTO> handleUntransferredPostingException() {
        String message = messageUtil.getMessage("error.organization.untransferred-posting");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PostingIsAlreadyTransferredException.class)
    public ResponseEntity<ResponseTO> handlePostingIsAlreadyTransferredException() {
        String message = messageUtil.getMessage("error.posting.already-transferred");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(BudgetCategoryNotFoundException.class)
    public ResponseEntity<ResponseTO> handleBudgetCategoryNotFound() {
        String message = messageUtil.getMessage("error.organization.budget-category-not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(BudgetCategoryWithNameExistsException.class)
    public ResponseEntity<ResponseTO> handleBudgetCategoryWithNameAlreadyExists() {
        String message = messageUtil.getMessage("error.organization.budget-category-with-name-exists");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(DefaultBudgetCategoryMustNotBeDeletedException.class)
    public ResponseEntity<ResponseTO> handleDefaultBudgetCategoryMustNotBeDeleted() {
        String message = messageUtil.getMessage("error.organization.default-budget-category-deletion");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(DefaultFlagOfBudgetCategoryMustNotBeRevokedException.class)
    public ResponseEntity<ResponseTO> handleDefaultFlagOfBudgetCategoryMustNotBeRevoked() {
        String message = messageUtil.getMessage("error.organization.default-flag-budget-category-revoked");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(BudgetCategoryIsNotAssignableException.class)
    public ResponseEntity<ResponseTO> handleBudgetCategoryIsNotAssignable() {
        String message = messageUtil.getMessage("error.organization.budget-category-not-assignable");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NoDefaultBudgetCategoryExistsException.class)
    public ResponseEntity<ResponseTO> handleNoDefaultBudgetCategoryExists() {
        String message = messageUtil.getMessage("error.organization.no-default-budget-category");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }
}
