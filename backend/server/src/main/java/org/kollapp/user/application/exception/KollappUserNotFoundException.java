package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class KollappUserNotFoundException extends AbstractLocalizedException {
    public KollappUserNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.user.not-found");
    }
}
