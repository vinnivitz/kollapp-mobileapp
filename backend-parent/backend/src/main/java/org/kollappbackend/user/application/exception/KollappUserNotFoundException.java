package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class KollappUserNotFoundException extends AbstractLocalizedException {
    public KollappUserNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.user.not-found");
    }
}
