package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class UsernameExistsException extends AbstractLocalizedException {
    public UsernameExistsException(MessageSource messageSource) {
        super(messageSource, "error.username.exists");
    }
}
