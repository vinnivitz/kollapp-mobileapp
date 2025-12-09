package org.kollapp.user.adapters.primary.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ValidationFailureResponseTO;
import org.kollapp.user.application.exception.EmailExistsException;
import org.kollapp.user.application.exception.EmailIsAlreadyConfirmedException;
import org.kollapp.user.application.exception.EmailIsNotConfirmedException;
import org.kollapp.user.application.exception.EmailNotFoundException;
import org.kollapp.user.application.exception.IncorrectPasswordException;
import org.kollapp.user.application.exception.InvalidConfirmationLinkException;
import org.kollapp.user.application.exception.InvalidRefreshTokenException;
import org.kollapp.user.application.exception.KollappUserNotFoundException;
import org.kollapp.user.application.exception.UsernameExistsException;
import org.kollapp.user.application.exception.UsernameNotFoundException;

@ControllerAdvice(basePackages = {"org.kollapp.user"})
@Order(0)
public class UserExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(UsernameExistsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleUsernameExists(UsernameExistsException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "username"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleUsernameNotFound(UsernameNotFoundException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "username"));
    }

    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailExists(EmailExistsException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailIsAlreadyConfirmedException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsAlreadyConfirmed(
            EmailIsAlreadyConfirmedException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailIsNotConfirmedException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsNotConfirmed(EmailIsNotConfirmedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailNotFound(EmailNotFoundException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleIncorrectPassword(IncorrectPasswordException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "password"));
    }

    @ExceptionHandler(InvalidConfirmationLinkException.class)
    public ResponseEntity<ErrorResponseTO> handleInvalidConfirmationLink(InvalidConfirmationLinkException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponseTO> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(KollappUserNotFoundException.class)
    public ResponseEntity<ErrorResponseTO> handleUserNotFound(KollappUserNotFoundException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.badRequest()
                .body(new ValidationFailureResponseTO(
                        messageSource.getMessage(
                                "validation.password.incorrect", null, LocaleContextHolder.getLocale()),
                        "password"));
    }
}
