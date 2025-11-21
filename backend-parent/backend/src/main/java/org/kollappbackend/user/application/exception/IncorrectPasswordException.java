package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class IncorrectPasswordException extends AbstractLocalizedException {
    public IncorrectPasswordException(MessageSource messageSource) {
        super(messageSource, "error.password.incorrect");
    }
}
