package com.none.kollappbackend.user.adapters.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ValidationFailureResponseTO;
import com.none.kollappbackend.user.application.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class KollappUserExceptionHandler {
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

    @ExceptionHandler(KollappUserNotFoundException.class)
    public ResponseEntity<ResponseTO> handleOrganizationNotFound(KollappUserNotFoundException ex) {
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
