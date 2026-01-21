package org.kollapp.core.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponseTO extends ResponseTO {
    @NotBlank
    private String message;

    public ErrorResponseTO(String message) {
        this.message = message;
    }
}
