package org.kollappbackend.user.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class InvalidConfirmationLinkException extends AbstractLocalizedException {
    public InvalidConfirmationLinkException(MessageSource messageSource) {
        super(messageSource, "error.confirmation-link.invalid");
    }
}
