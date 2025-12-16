package org.kollapp.notification.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

/**
 * Exception thrown when push notification sending fails.
 */
public class PushNotificationException extends AbstractLocalizedException {
    public PushNotificationException(MessageSource messageSource) {
        super(messageSource, "error.notification.failed");
    }
}
