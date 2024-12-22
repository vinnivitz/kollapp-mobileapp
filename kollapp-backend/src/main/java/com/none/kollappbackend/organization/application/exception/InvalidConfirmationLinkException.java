package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

public class InvalidConfirmationLinkException extends AbstractLocalizedException {
    public InvalidConfirmationLinkException(MessageSource messageSource) {
        super(messageSource, "error.confirmation-link.invalid");
    }
}
