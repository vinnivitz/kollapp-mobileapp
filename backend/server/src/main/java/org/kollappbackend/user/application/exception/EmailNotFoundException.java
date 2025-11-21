package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailNotFoundException extends AbstractLocalizedException {
    public EmailNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.email.not-found");
    }
}
