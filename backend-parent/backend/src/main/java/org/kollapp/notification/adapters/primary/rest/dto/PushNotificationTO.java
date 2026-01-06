package org.kollapp.notification.adapters.primary.rest.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Transfer object for push notification response.
 */
@Getter
@Setter
@NoArgsConstructor
public class PushNotificationTO {
    private long id;

    private String title;

    private String body;

    private String data;

    private NotificationType notificationType;

    private LocalDateTime createdAt;
}
