package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class EmailNotFoundException extends AbstractLocalizedException {
    public EmailNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.email.not-found");
    }
}
