package org.kollapp.core.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataResponseTO<T> extends MessageResponseTO {
    @NotNull
    private T data;

    public DataResponseTO(T data, String message) {
        super(message);
        this.data = data;
    }
}
