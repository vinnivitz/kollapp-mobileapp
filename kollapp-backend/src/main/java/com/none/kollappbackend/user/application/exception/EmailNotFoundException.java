package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailNotFoundException extends AbstractLocalizedException {
    public EmailNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.email.not-found");
    }
}
