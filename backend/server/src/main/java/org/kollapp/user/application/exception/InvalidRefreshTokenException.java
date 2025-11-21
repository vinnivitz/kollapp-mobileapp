package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class InvalidRefreshTokenException extends AbstractLocalizedException {
    public InvalidRefreshTokenException(MessageSource messageSource) {
        super(messageSource, "error.jwt.refresh.invalid");
    }
}
