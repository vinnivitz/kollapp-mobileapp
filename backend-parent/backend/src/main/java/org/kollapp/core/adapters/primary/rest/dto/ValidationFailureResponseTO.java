package org.kollapp.core.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationFailureResponseTO extends ResponseTO {
    @NotBlank
    private String message;

    private String validationField;

    public ValidationFailureResponseTO(String message, String validationField) {
        this.message = message;
        this.validationField = validationField;
    }
}
