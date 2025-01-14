package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailIsNotConfirmedException extends AbstractLocalizedException {
    public EmailIsNotConfirmedException(MessageSource messageSource) {
        super(messageSource, "error.email.not-confirmed");
    }
}
