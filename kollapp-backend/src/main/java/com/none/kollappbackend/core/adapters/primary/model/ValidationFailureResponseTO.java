package com.none.kollappbackend.core.adapters.primary.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ValidationFailureResponseTO extends ResponseTO {
    private String message;
    private String validationField;
}
