package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailIsAlreadyConfirmedException extends AbstractLocalizedException {
    public EmailIsAlreadyConfirmedException(MessageSource messageSource) {
        super(messageSource, "error.email.already-confirmed");
    }
}
