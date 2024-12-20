package com.none.kollappbackend.organization.application.exception;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

public class Localization extends RuntimeException {
    @Autowired
    private MessageSource messageSource;

    public Localization(String message) {
        super(message);
    }

    @Override
    public String getLocalizedMessage() {
        return messageSource.getMessage(getMessage(), null, LocaleContextHolder.getLocale());
    }
}
