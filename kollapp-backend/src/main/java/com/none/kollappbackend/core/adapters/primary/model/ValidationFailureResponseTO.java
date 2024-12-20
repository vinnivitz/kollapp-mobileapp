package com.none.kollappbackend.core.adapters.primary.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ValidationFailureResponseTO extends MessageResponseTO {
    private String validationField;

    public ValidationFailureResponseTO(String message, String validationField) {
        super(message);
        this.validationField = validationField;
    }
}
