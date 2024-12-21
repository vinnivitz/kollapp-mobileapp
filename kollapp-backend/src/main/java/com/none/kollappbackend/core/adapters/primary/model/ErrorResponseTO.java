package com.none.kollappbackend.core.adapters.primary.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ErrorResponseTO extends ResponseTO {
    private String message;
}
