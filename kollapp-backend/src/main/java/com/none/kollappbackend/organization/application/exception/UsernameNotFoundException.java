package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class UsernameNotFoundException extends AbstractLocalizedException {
    public UsernameNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.username.not-found");
    }
}
