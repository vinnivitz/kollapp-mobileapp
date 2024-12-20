package com.none.kollappbackend.core.adapters.primary.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DataResponseTO extends MessageResponseTO {
    private Object data;

    public DataResponseTO(Object data, String message) {
        super(message);
        this.data = data;
    }
}
