package org.kollappbackend.user.adapters.rest;

import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ValidationFailureResponseTO;
import org.kollappbackend.user.application.exception.EmailExistsException;
import org.kollappbackend.user.application.exception.EmailIsAlreadyConfirmedException;
import org.kollappbackend.user.application.exception.EmailIsNotConfirmedException;
import org.kollappbackend.user.application.exception.EmailNotFoundException;
import org.kollappbackend.user.application.exception.IncorrectPasswordException;
import org.kollappbackend.user.application.exception.InvalidConfirmationLinkException;
import org.kollappbackend.user.application.exception.InvalidRefreshTokenException;
import org.kollappbackend.user.application.exception.KollappUserNotFoundException;
import org.kollappbackend.user.application.exception.UsernameExistsException;
import org.kollappbackend.user.application.exception.UsernameNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@Order(1)
@ControllerAdvice(basePackages = {"org.kollappbackend.user"})
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
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsAlreadyConfirmed(EmailIsAlreadyConfirmedException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
    }

    @ExceptionHandler(EmailIsNotConfirmedException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsNotConfirmed(EmailIsNotConfirmedException ex) {
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(ex.getMessage(), "email"));
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
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(
                messageSource.getMessage("validation.password.incorrect", null, LocaleContextHolder.getLocale()),
                "password"));
    }
}
