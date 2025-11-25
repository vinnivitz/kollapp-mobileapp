package org.kollappbackend.organization.adapters.primary.rest;

import org.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.exception.InvalidInvitationCodeException;
import org.kollappbackend.organization.application.exception.LastManagerException;
import org.kollappbackend.organization.application.exception.OrganizationAuthorizationException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonAlreadyHasTargetRoleException;
import org.kollappbackend.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollappbackend.organization.application.exception.PostingDoesNotExistException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

@ControllerAdvice(basePackages = {"org.kollappbackend.organization"})
@RestController
public class OrganizationExceptionHandler {
    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ResponseTO> handleOrganizationNotFound(OrganizationNotFoundException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PersonNotRegisteredInOrganizationException.class)
    public ResponseEntity<ResponseTO> handlePersonNotRegisteredInOrganization(
            PersonNotRegisteredInOrganizationException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(ActivityNotFoundException.class)
    public ResponseEntity<ResponseTO> handleActivityNotFound(ActivityNotFoundException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PostingDoesNotExistException.class)
    public ResponseEntity<ResponseTO> handlePostingNotFound(PostingDoesNotExistException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(InvalidInvitationCodeException.class)
    public ResponseEntity<ResponseTO> handleInvalidInvitationCode(InvalidInvitationCodeException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PersonOfOrganizationIsNotApprovedYetException.class)
    public ResponseEntity<ResponseTO> handlePersonOfOrganizationIsNotApprovedYet(
            PersonOfOrganizationIsNotApprovedYetException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(OrganizationAuthorizationException.class)
    public ResponseEntity<ResponseTO> handleOrganizationAuthorizationException(OrganizationAuthorizationException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PersonAlreadyRegisteredInOrganizationException.class)
    public ResponseEntity<ResponseTO> handlePersonAlreadyRegisteredInOrganization(
            PersonAlreadyRegisteredInOrganizationException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(LastManagerException.class)
    public ResponseEntity<ResponseTO> handleLastManager(LastManagerException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PersonAlreadyHasTargetRoleException.class)
    public ResponseEntity<ResponseTO> handlePersonAlreadyHasTargetRole(PersonAlreadyHasTargetRoleException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }
}
