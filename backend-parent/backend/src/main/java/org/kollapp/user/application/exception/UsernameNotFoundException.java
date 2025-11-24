package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class UsernameNotFoundException extends AbstractLocalizedException {
    public UsernameNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.username.not-found");
    }
}
