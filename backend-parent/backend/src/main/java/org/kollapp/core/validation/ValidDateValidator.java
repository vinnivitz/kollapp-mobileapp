package org.kollapp.core.validation;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidDateValidator implements ConstraintValidator<ValidDate, String> {

    private LocalDate min;
    private LocalDate max;

    @Override
    public void initialize(ValidDate constraintAnnotation) {
        this.min = parseBound(constraintAnnotation.min());
        this.max = parseBound(constraintAnnotation.max());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        LocalDate date;
        try {
            date = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ex) {
            return false;
        }

        if (min != null && date.isBefore(min)) {
            return false;
        }
        return !(max != null && date.isAfter(max));
    }

    private static LocalDate parseBound(String bound) {
        if (bound == null || bound.isBlank()) {
            return null;
        }
        return LocalDate.parse(bound, DateTimeFormatter.ISO_LOCAL_DATE);
    }
}
