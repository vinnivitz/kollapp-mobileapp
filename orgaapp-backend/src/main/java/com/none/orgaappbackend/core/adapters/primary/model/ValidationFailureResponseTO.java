package com.none.orgaappbackend.core.adapters.primary.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ValidationFailureResponseTO extends ResponseTO {
    private String message;
    private String validationField;
}
