package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ValidationFailureResponseTO;
import com.none.kollappbackend.organization.application.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

@Slf4j
@Order(1)
@ControllerAdvice(basePackages = {"com.none.kollappbackend.organization"})
public class OrganizationExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(UsernameExistsException.class)
    public ResponseEntity<ResponseTO> handleUsernameExists(UsernameExistsException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "username"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ResponseTO> handleUsernameNotFound(UsernameNotFoundException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "username"));
    }

    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ResponseTO> handleEmailExists(EmailExistsException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailIsAlreadyConfirmedException.class)
    public ResponseEntity<ResponseTO> handleEmailIsAlreadyConfirmed(EmailIsAlreadyConfirmedException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailIsNotConfirmedException.class)
    public ResponseEntity<ResponseTO> handleEmailIsNotConfirmed(EmailIsNotConfirmedException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ResponseTO> handleEmailNotFound(EmailNotFoundException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<ResponseTO> handleIncorrectPassword(IncorrectPasswordException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(ex.getMessage(), "password"));
    }

    @ExceptionHandler(InvalidConfirmationLinkException.class)
    public ResponseEntity<ResponseTO> handleInvalidConfirmationLink(InvalidConfirmationLinkException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ResponseTO> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ResponseTO> handleOrganizationNotFound(OrganizationNotFoundException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseTO> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(messageSource.getMessage("validation.password.incorrect", null,
                        LocaleContextHolder.getLocale()), "password"));
    }
}
