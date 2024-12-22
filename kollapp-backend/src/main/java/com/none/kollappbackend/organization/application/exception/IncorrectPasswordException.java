package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class IncorrectPasswordException extends AbstractLocalizedException {
    public IncorrectPasswordException(MessageSource messageSource) {
        super(messageSource, "error.password.incorrect");
    }
}
