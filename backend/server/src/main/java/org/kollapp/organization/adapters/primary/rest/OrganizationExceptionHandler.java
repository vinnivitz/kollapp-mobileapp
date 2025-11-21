package org.kollapp.organization.adapters.primary.rest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ResponseTO;
import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.InvalidInvitationCodeException;
import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;

@ControllerAdvice(basePackages = {"org.kollapp.organization"})
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
    public ResponseEntity<ResponseTO> handleInvalidInvitationCode(
            InvalidInvitationCodeException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PersonOfOrganizationIsNotApprovedYetException.class)
    public ResponseEntity<ResponseTO> handlePersonOfOrganizationIsNotApprovedYet(
            PersonOfOrganizationIsNotApprovedYetException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(OrganizationAuthorizationException.class)
    public ResponseEntity<ResponseTO> handleOrganizationAuthorizationException(
            OrganizationAuthorizationException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponseTO(ex.getMessage()));
    }
}
