package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class InvalidInvitationCodeException extends AbstractLocalizedException {
    public InvalidInvitationCodeException(MessageSource messageSource) {
        super(messageSource, "error.invitationcode.invalid");
    }
}
