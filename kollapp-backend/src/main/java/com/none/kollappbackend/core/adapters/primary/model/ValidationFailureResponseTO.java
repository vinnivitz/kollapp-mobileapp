package com.none.kollappbackend.core.adapters.primary.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationFailureResponseTO extends ResponseTO {
    private String message;
    private String validationField;

    public ValidationFailureResponseTO(String message) {
        this.message = message;
    }

    public ValidationFailureResponseTO(String message, String validationField) {
        this.message = message;
        this.validationField = validationField;
    }
}
