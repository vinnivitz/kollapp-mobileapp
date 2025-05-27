package org.kollappbackend.organization.adapters.primary.rest;

import org.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.exception.InvalidInvitationCodeException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice(basePackages = {"org.kollappbackend.organization"})
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

    @ExceptionHandler(InvalidInvitationCodeException.class)
    public ResponseEntity<ResponseTO> handleInvalidInvitationCode(InvalidInvitationCodeException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }
}
