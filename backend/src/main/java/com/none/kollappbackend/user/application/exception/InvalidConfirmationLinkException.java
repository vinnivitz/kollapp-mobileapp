package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class InvalidConfirmationLinkException extends AbstractLocalizedException {
    public InvalidConfirmationLinkException(MessageSource messageSource) {
        super(messageSource, "error.confirmation-link.invalid");
    }
}
