package org.kollappbackend.core.adapters.primary.rest.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.MessageSource;

@Getter
@Setter
public class DataResponseTO extends MessageResponseTO {
    private Object data;

    public DataResponseTO(Object data, String message, MessageSource messageSource) {
        super(message, messageSource);
        this.data = data;
    }
}
