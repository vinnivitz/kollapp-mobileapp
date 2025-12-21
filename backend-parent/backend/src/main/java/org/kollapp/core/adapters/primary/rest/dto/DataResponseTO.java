package org.kollapp.core.adapters.primary.rest.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataResponseTO<T> extends MessageResponseTO {
    private T data;

    public DataResponseTO(T data, String message) {
        super(message);
        this.data = data;
    }
}
