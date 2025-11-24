package org.kollapp.user.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class InvalidConfirmationLinkException extends AbstractLocalizedException {
    public InvalidConfirmationLinkException(MessageSource messageSource) {
        super(messageSource, "error.confirmation-link.invalid");
    }
}
