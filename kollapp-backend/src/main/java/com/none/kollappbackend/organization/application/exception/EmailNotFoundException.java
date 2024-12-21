package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class EmailNotFoundException extends AbstractLocalizedException {
    public EmailNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.email.not-found");
    }
}
