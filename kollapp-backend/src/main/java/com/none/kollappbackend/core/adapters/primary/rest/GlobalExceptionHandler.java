package com.none.kollappbackend.core.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ValidationFailureResponseTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Arrays;
import java.util.List;

@Slf4j
@ControllerAdvice
@Order(2)
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseTO> handleValidationExceptions(
            MethodArgumentNotValidException exception) {
            List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors();
            FieldError firstError = fieldErrors.getFirst();
            String message = firstError.getDefaultMessage();
            ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(message,
                    firstError.getField());
            return ResponseEntity.badRequest().body(responseTO);
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseTO> handleException(Exception exception) {
        log.error(exception.getMessage() + "\n\n" + exception);
        return ResponseEntity.internalServerError().body(new ErrorResponseTO("error.generic", messageSource));
    }
}
