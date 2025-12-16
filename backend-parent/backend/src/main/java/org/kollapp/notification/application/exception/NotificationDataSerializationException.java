package org.kollapp.notification.application.exception;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class NotificationDataSerializationException extends AbstractLocalizedException {
    public NotificationDataSerializationException(org.springframework.context.MessageSource messageSource) {
        super(messageSource, "error.notification.data.serialization-failed");
    }
}
