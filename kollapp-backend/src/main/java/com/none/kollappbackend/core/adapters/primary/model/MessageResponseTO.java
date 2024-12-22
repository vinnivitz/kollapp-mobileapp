package com.none.kollappbackend.core.adapters.primary.model;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MessageResponseTO extends ResponseTO {
    private String message;

    public MessageResponseTO(String message, MessageSource messageSource) {
        this.message = messageSource.getMessage(message, null, LocaleContextHolder.getLocale());
    }
}
