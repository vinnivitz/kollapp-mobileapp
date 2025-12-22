package org.kollapp.core.adapters.primary.rest.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MessageResponseTO extends ResponseTO {
    private String message;

    public MessageResponseTO(String message) {
        this.message = message;
    }
}
