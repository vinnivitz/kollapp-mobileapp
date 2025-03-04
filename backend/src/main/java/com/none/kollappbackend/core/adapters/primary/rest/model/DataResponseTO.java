package com.none.kollappbackend.core.adapters.primary.rest.model;

import org.springframework.context.MessageSource;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataResponseTO extends MessageResponseTO {
    private Object data;

    public DataResponseTO(Object data, String message, MessageSource messageSource) {
        super(message, messageSource);
        this.data = data;
    }
}
