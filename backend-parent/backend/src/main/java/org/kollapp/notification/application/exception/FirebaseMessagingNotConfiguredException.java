package org.kollapp.notification.application.exception;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class FirebaseMessagingNotConfiguredException extends AbstractLocalizedException {
    public FirebaseMessagingNotConfiguredException(org.springframework.context.MessageSource messageSource) {
        super(messageSource, "error.firebase-messaging.not-configured");
    }
}
