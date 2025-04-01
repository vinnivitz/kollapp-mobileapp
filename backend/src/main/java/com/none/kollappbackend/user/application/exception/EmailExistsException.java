package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class EmailExistsException extends AbstractLocalizedException {
    public EmailExistsException(MessageSource messageSource) {
        super(messageSource, "error.email.exists");
    }
}
