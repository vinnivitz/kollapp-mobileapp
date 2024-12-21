package com.none.kollappbackend.core.adapters.primary.model;

import org.springframework.context.MessageSource;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataResponseTO extends MessageResponseTO {
    private Object data;

    public DataResponseTO(MessageSource messageSource, Object data, String message) {
        super(messageSource, message);
        this.data = data;
    }
}
