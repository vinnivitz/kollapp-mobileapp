package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class InvalidRefreshTokenException extends AbstractLocalizedException {
    public InvalidRefreshTokenException(MessageSource messageSource) {
        super(messageSource, "error.jwt.refresh.invalid");
    }
}
