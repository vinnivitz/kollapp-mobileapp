package org.kollapp.notification.application.exception;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

/**
 * Exception thrown when push notification sending fails.
 */
public class PushNotificationException extends AbstractLocalizedException {
    public PushNotificationException() {
        super();
    }
}
