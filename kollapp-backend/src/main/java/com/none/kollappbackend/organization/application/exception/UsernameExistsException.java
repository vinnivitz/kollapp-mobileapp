package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class UsernameExistsException extends AbstractLocalizedException {
    public UsernameExistsException(MessageSource messageSource) {
        super(messageSource, "error.username.exists");
    }
}
