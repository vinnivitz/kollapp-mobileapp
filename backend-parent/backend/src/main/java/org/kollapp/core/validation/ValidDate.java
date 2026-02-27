package org.kollapp.core.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {ValidDateValidator.class})
@Documented
public @interface ValidDate {

    String message();

    /**
     * Inclusive minimum allowed date in ISO-8601 format (yyyy-MM-dd). Empty means unbounded.
     */
    String min() default "";

    /**
     * Inclusive maximum allowed date in ISO-8601 format (yyyy-MM-dd). Empty means unbounded.
     */
    String max() default "";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
