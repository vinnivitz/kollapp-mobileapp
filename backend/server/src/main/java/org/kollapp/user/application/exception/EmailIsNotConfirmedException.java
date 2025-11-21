package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class EmailIsNotConfirmedException extends AbstractLocalizedException {
    public EmailIsNotConfirmedException(MessageSource messageSource) {
        super(messageSource, "error.email.not-confirmed");
    }
}
