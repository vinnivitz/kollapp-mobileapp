package com.none.kollappbackend.core.adapters.primary.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
public class MessageResponseTO extends ResponseTO {
    @Autowired
    private transient MessageSource messageSource;

    private String message;

    public MessageResponseTO(String message) {
        this.message = message;
    }

    public String getString() {
        return messageSource.getMessage(message, null, LocaleContextHolder.getLocale());
    }
}
