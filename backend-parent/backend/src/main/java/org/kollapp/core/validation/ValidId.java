package org.kollapp.core.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;

@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
@Positive(message = "{error.invalid-path-variable}")
@Digits(integer = 10, fraction = 0, message = "{error.invalid-path-variable}")
@Documented
public @interface ValidId {

    String message() default "{error.invalid-path-variable}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
