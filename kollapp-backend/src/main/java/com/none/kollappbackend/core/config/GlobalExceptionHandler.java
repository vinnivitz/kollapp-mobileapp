package com.none.kollappbackend.core.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;

import java.util.List;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationFailureResponseTO> handleValidationExceptions(
            MethodArgumentNotValidException exception) {
        List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors();

        if (!fieldErrors.isEmpty()) {
            FieldError firstError = fieldErrors.get(0);

            ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(firstError.getDefaultMessage(),
                    firstError.getField());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseTO);
        }

        ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO("Validation failed", null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseTO);
    }
}
