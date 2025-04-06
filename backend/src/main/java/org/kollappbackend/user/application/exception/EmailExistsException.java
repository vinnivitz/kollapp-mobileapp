package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailExistsException extends AbstractLocalizedException {
    public EmailExistsException(MessageSource messageSource) {
        super(messageSource, "error.email.exists");
    }
}
