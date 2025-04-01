package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class UsernameExistsException extends AbstractLocalizedException {
    public UsernameExistsException(MessageSource messageSource) {
        super(messageSource, "error.username.exists");
    }
}
