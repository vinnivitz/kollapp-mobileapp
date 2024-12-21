package com.none.kollappbackend.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ResponseTO;
import com.none.kollappbackend.core.adapters.primary.model.ValidationFailureResponseTO;

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

                log.info(firstError.getDefaultMessage());
                ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO(firstError.getDefaultMessage(),
                        firstError.getField());

                return ResponseEntity.badRequest().body(responseTO);
            }

            ValidationFailureResponseTO responseTO = new ValidationFailureResponseTO("Validation failed", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseTO);
        } catch (Exception e) {
            log.error("Error occurred while handling validation exception", e);
            return ResponseEntity.internalServerError().body(new ErrorResponseTO(
                    messageSource.getMessage("error.generic", null, LocaleContextHolder.getLocale())));
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseTO> handleException(Exception exception) {
        if (exception instanceof NoSuchMessageException) {
            log.error(exception.getMessage());
        } else {
            log.error("Error occurred", exception);
        }
        return ResponseEntity.internalServerError().body(new ErrorResponseTO(
                messageSource.getMessage("error.generic", null, LocaleContextHolder.getLocale())));
    }
}
