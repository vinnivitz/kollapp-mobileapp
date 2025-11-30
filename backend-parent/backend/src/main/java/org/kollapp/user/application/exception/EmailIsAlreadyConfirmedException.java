package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class EmailIsAlreadyConfirmedException extends AbstractLocalizedException {
    public EmailIsAlreadyConfirmedException(MessageSource messageSource) {
        super(messageSource, "error.email.already-confirmed");
    }
}
