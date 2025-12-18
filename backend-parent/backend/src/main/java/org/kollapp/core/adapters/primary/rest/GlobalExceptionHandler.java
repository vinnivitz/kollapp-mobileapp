package org.kollapp.core.adapters.primary.rest;

import java.util.List;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ValidationFailureResponseTO;

@Slf4j
@ControllerAdvice
@Order(1)
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseTO> handleValidationExceptions(MethodArgumentNotValidException exception) {
        List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors();
        FieldError firstError = fieldErrors.getFirst();
        String message = firstError.getDefaultMessage();
        ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(message, firstError.getField());
        return ResponseEntity.badRequest().body(responseTO);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ResponseTO> handleConstraintViolation(ConstraintViolationException exception) {
        ConstraintViolation<?> firstViolation =
                exception.getConstraintViolations().stream().findFirst().orElse(null);
        if (firstViolation == null) {
            return ResponseEntity.badRequest().body(new ErrorResponseTO("error.validation.generic", messageSource));
        }
        String message = firstViolation.getMessage();
        String propertyPath = firstViolation.getPropertyPath().toString();
        String fieldName =
                propertyPath.contains(".") ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1) : propertyPath;
        return ResponseEntity.badRequest().body(new ValidationFailureResponseTO(message, fieldName));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseTO> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO("error.invalid-input", messageSource));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ResponseTO> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponseTO("error.invalid-type", messageSource));
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
        return ResponseEntity.internalServerError().body(new ErrorResponseTO("error.generic", messageSource));
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ResponseTO> handleAuthorizationDenied(AuthorizationDeniedException ex) {
        log.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponseTO("error.authorization", messageSource));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseTO> handleUnhandledException(RuntimeException ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseTO("error.generic", messageSource));
    }
}
