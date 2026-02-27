package org.kollapp.core.validation;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ValidDateValidatorTest {

    private final Validator validator =
            Validation.buildDefaultValidatorFactory().getValidator();

    private static final class RangeDto {
        @ValidDate(min = "2025-01-01", max = "2025-12-31", message = "invalid date")
        private final String date;

        private RangeDto(String date) {
            this.date = date;
        }
    }

    @Test
    void acceptsNull() {
        Set<ConstraintViolation<RangeDto>> violations = validator.validate(new RangeDto(null));
        assertThat(violations).isEmpty();
    }

    @Test
    void rejectsInvalidFormat() {
        Set<ConstraintViolation<RangeDto>> violations = validator.validate(new RangeDto("2025/01/01"));
        assertThat(violations).isNotEmpty();
    }

    @Test
    void rejectsBeforeMin() {
        Set<ConstraintViolation<RangeDto>> violations = validator.validate(new RangeDto("2024-12-31"));
        assertThat(violations).isNotEmpty();
    }

    @Test
    void rejectsAfterMax() {
        Set<ConstraintViolation<RangeDto>> violations = validator.validate(new RangeDto("2026-01-01"));
        assertThat(violations).isNotEmpty();
    }

    @Test
    void acceptsWithinRangeInclusive() {
        assertThat(validator.validate(new RangeDto("2025-01-01"))).isEmpty();
        assertThat(validator.validate(new RangeDto("2025-06-30"))).isEmpty();
        assertThat(validator.validate(new RangeDto("2025-12-31"))).isEmpty();
    }
}
