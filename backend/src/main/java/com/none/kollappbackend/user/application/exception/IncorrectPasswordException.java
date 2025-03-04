package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class IncorrectPasswordException extends AbstractLocalizedException {
    public IncorrectPasswordException(MessageSource messageSource) {
        super(messageSource, "error.password.incorrect");
    }
}
