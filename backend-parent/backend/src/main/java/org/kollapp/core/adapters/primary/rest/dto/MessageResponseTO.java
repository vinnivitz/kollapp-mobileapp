package org.kollapp.core.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MessageResponseTO extends ResponseTO {
    @NotBlank
    private String message;

    public MessageResponseTO(String message) {
        this.message = message;
    }
}
