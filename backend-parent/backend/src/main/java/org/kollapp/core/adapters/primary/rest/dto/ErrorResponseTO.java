package org.kollapp.core.adapters.primary.rest.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponseTO extends ResponseTO {
    private String message;

    public ErrorResponseTO(String message) {
        this.message = message;
    }
}
