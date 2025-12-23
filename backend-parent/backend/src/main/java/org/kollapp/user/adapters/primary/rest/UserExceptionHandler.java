package org.kollapp.user.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ValidationFailureResponseTO;
import org.kollapp.user.application.exception.EmailExistsException;
import org.kollapp.user.application.exception.EmailIsAlreadyConfirmedException;
import org.kollapp.user.application.exception.EmailIsNotConfirmedException;
import org.kollapp.user.application.exception.EmailNotFoundException;
import org.kollapp.user.application.exception.IncorrectPasswordException;
import org.kollapp.user.application.exception.InvalidConfirmationLinkException;
import org.kollapp.user.application.exception.InvalidRefreshTokenException;
import org.kollapp.user.application.exception.InvalidSystemRoleException;
import org.kollapp.user.application.exception.KollappUserNotFoundException;
import org.kollapp.user.application.exception.UsernameExistsException;
import org.kollapp.user.application.exception.UsernameNotFoundException;

@ControllerAdvice(basePackages = {"org.kollapp.user"})
@AllArgsConstructor
public class UserExceptionHandler {

    private final MessageUtil messageUtil;

    @ExceptionHandler(UsernameExistsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleUsernameExists() {
        String message = messageUtil.getMessage("error.username.exists");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ValidationFailureResponseTO(message, "username"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleUsernameNotFound() {
        String message = messageUtil.getMessage("error.username.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ValidationFailureResponseTO(message, "username"));
    }

    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailExists() {
        String message = messageUtil.getMessage("error.email.exists");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ValidationFailureResponseTO(message, "email"));
    }

    @ExceptionHandler(EmailIsAlreadyConfirmedException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsAlreadyConfirmed() {
        String message = messageUtil.getMessage("error.email.already-confirmed");
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(message, "email"));
    }

    @ExceptionHandler(EmailIsNotConfirmedException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailIsNotConfirmed() {
        String message = messageUtil.getMessage("error.email.not-confirmed");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ValidationFailureResponseTO(message, "email"));
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleEmailNotFound() {
        String message = messageUtil.getMessage("error.email.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ValidationFailureResponseTO(message, "email"));
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleIncorrectPassword() {
        String message = messageUtil.getMessage("error.password.incorrect");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ValidationFailureResponseTO(message, "password"));
    }

    @ExceptionHandler(InvalidConfirmationLinkException.class)
    public ResponseEntity<ErrorResponseTO> handleInvalidConfirmationLink() {
        String message = messageUtil.getMessage("error.confirmation-link.invalid");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponseTO> handleInvalidRefreshToken() {
        String message = messageUtil.getMessage("error.jwt.refresh.invalid");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(KollappUserNotFoundException.class)
    public ResponseEntity<ErrorResponseTO> handleUserNotFound() {
        String message = messageUtil.getMessage("error.user.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleBadCredentials(BadCredentialsException ex) {
        String message = messageUtil.getMessage("validation.password.incorrect");
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(message, "password"));
    }

    @ExceptionHandler(InvalidSystemRoleException.class)
    public ResponseEntity<ErrorResponseTO> handleInvalidSystemRole() {
        String message = messageUtil.getMessage("error.system-role.invalid");
        return ResponseEntity.badRequest().body(new ErrorResponseTO(message));
    }
}
