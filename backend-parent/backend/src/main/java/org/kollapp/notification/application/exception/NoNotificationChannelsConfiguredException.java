package org.kollapp.notification.application.exception;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

/**
 * Exception thrown when no notification channels are configured.
 */
public class NoNotificationChannelsConfiguredException extends AbstractLocalizedException {
    public NoNotificationChannelsConfiguredException() {
        super();
    }
}
