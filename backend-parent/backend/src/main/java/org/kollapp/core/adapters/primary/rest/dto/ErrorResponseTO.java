package org.kollapp.core.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponseTO extends ResponseTO {
    @NotBlank
    private String message;

    private ErrorCodeTO errorCode;

    public ErrorResponseTO(String message) {
        this.message = message;
    }

    public ErrorResponseTO(String message, ErrorCodeTO errorCode) {
        this.message = message;
        this.errorCode = errorCode;
    }
}
