package org.kollapp.core.adapters.primary.rest;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.NoSuchMessageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ValidationFailureResponseTO;

@Slf4j
@ControllerAdvice
@AllArgsConstructor
public class GlobalExceptionHandler {

    private final MessageUtil messageUtil;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseTO> handleValidationExceptions(MethodArgumentNotValidException exception) {
        List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors();
        FieldError firstError = fieldErrors.getFirst();
        String message = firstError.getDefaultMessage();
        ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(message, firstError.getField());
        return ResponseEntity.badRequest().body(responseTO);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ResponseTO> handleNoResourceFound(NoResourceFoundException ex) {
        log.error(ex.getMessage());
        String message = messageUtil.getMessage("error.resource-not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseTO> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        log.error(ex.getMessage());
        String message = messageUtil.getMessage("error.method-not-allowed");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NoSuchMessageException.class)
    public ResponseEntity<ResponseTO> handleNoSuchMessage(NoSuchMessageException ex) {
        log.error(ex.getMessage());
        String message = messageUtil.getMessage("error.generic");
        return ResponseEntity.internalServerError().body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ResponseTO> handleAuthorizationDenied(AuthorizationDeniedException ex) {
        log.error(ex.getMessage());
        String message = messageUtil.getMessage("error.authorization");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseTO(message));
    }
}
