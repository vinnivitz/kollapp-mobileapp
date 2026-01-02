package org.kollapp.core.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MessageUtil {

    private final MessageSource messageSource;

    public String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    public String getMessage(String code, Object... params) {
        return messageSource.getMessage(code, params, LocaleContextHolder.getLocale());
    }
}
