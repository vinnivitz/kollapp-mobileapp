package org.kollapp.core.adapters.primary.rest.dto;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.MessageSource;

@Getter
@Setter
public class DataResponseTO<T> extends MessageResponseTO {
    private T data;

    public DataResponseTO(T data, String message, MessageSource messageSource) {
        super(message, messageSource);
        this.data = data;
    }
}
