package org.kollapp.notification.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class NoActiveDeviceTokenFoundException extends AbstractLocalizedException {
    public NoActiveDeviceTokenFoundException(MessageSource messageSource) {
        super(messageSource, "error.device-token.no-active-token-found");
    }
}
