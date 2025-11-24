package org.kollapp.core.application.exceptions;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

public abstract class AbstractLocalizedException extends RuntimeException {
    public AbstractLocalizedException(MessageSource messageSource, String message) {
        super(messageSource.getMessage(message, null, LocaleContextHolder.getLocale()));
    }
}
