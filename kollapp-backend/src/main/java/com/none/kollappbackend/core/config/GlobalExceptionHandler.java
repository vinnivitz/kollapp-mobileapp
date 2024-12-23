package com.none.kollappbackend.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;
import com.none.kollappbackend.organization.application.exception.EmailExistsException;
import com.none.kollappbackend.organization.application.exception.EmailIsAlreadyConfirmedException;
import com.none.kollappbackend.organization.application.exception.EmailIsNotConfirmedException;
import com.none.kollappbackend.organization.application.exception.EmailNotFoundException;
import com.none.kollappbackend.organization.application.exception.IncorrectPasswordException;
import com.none.kollappbackend.organization.application.exception.InvalidConfirmationLinkException;
import com.none.kollappbackend.organization.application.exception.InvalidRefreshTokenException;
import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.exception.UsernameExistsException;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseTO> handleValidationExceptions(
            MethodArgumentNotValidException exception) {
        try {

            List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors();

            if (!fieldErrors.isEmpty()) {
                FieldError firstError = fieldErrors.get(0);

                String message = firstError.getDefaultMessage();

                ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(message,
                        firstError.getField());

                return ResponseEntity.badRequest().body(responseTO);
            }

            ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO("Validation failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseTO);
        } catch (Exception e) {
            log.error("Error occurred while handling validation exception " + e);
            return ResponseEntity.internalServerError().body(new ErrorResponseTO("error.generic", messageSource));
        }
    }

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

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ResponseTO> handleNoResourceFound(NoResourceFoundException ex) {
        log.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseTO("error.resource-not-found", messageSource));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseTO> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        log.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(new ErrorResponseTO("error.method-not-allowed", messageSource));
    }

    @ExceptionHandler(NoSuchMessageException.class)
    public ResponseEntity<ResponseTO> handleNoSuchMessage(NoSuchMessageException ex) {
        log.error(ex.getMessage());
        return ResponseEntity.internalServerError()
                .body(new ErrorResponseTO("error.generic", messageSource));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseTO> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(messageSource.getMessage("validation.password.incorrect", null,
                        LocaleContextHolder.getLocale()), "password"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseTO> handleException(Exception exception) {
        log.error(exception.getMessage() + "\n\n" + exception);
        return ResponseEntity.internalServerError().body(new ErrorResponseTO("error.generic", messageSource));
    }
}
