package com.none.kollappbackend.core.adapters.primary.rest.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

@Getter
@Setter
public class ErrorResponseTO extends ResponseTO {
    private String message;

    public ErrorResponseTO(String message) {
        this.message = message;
    }

    public ErrorResponseTO(String message, MessageSource messageSource) {
        this.message = messageSource.getMessage(message, null, LocaleContextHolder.getLocale());
    }
}
