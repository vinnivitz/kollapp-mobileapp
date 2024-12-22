package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class EmailIsNotConfirmedException extends AbstractLocalizedException {
    public EmailIsNotConfirmedException(MessageSource messageSource) {
        super(messageSource, "error.email.not-confirmed");
    }
}
