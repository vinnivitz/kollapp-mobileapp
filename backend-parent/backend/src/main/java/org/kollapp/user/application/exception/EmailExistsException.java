package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class EmailExistsException extends AbstractLocalizedException {
    public EmailExistsException(MessageSource messageSource) {
        super(messageSource, "error.email.exists");
    }
}
