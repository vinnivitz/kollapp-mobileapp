package org.kollapp.notification.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

/**
 * Exception thrown when a device token is not found.
 */
public class DeviceTokenNotFoundException extends AbstractLocalizedException {
    public DeviceTokenNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.device-token.not-found");
    }
}
