package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class InvalidInvitationCodeException extends AbstractLocalizedException {
    public InvalidInvitationCodeException(MessageSource messageSource) {
        super(messageSource, "error.invitationcode.invalid");
    }
}
