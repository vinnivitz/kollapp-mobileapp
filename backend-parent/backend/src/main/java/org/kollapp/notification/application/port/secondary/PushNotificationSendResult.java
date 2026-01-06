package org.kollapp.notification.application.port.secondary;

import lombok.Value;

import org.kollapp.notification.domain.enums.NotificationStatus;

@Value
public final class PushNotificationSendResult {

    private NotificationStatus status;

    private String errorMessage;

    private boolean invalidToken;

    public static PushNotificationSendResult sent() {
        return new PushNotificationSendResult(NotificationStatus.SENT, null, false);
    }

    public static PushNotificationSendResult failed(String errorMessage, boolean invalidToken) {
        return new PushNotificationSendResult(NotificationStatus.FAILED, errorMessage, invalidToken);
    }
}
