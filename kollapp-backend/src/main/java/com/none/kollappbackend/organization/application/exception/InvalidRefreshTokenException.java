package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class InvalidRefreshTokenException extends AbstractLocalizedException {
    public InvalidRefreshTokenException(MessageSource messageSource) {
        super(messageSource, "error.jwt.refresh.invalid");
    }
}
