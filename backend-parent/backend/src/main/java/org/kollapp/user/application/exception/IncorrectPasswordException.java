package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class IncorrectPasswordException extends AbstractLocalizedException {
    public IncorrectPasswordException(MessageSource messageSource) {
        super(messageSource, "error.password.incorrect");
    }
}
