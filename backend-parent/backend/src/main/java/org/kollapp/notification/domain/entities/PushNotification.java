package org.kollapp.notification.domain.entities;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.domain.enums.NotificationStatus;
import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Entity representing a push notification record.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PushNotification {
    private Long id;

    private long userId;

    private String title;

    private String body;

    private String data;

    private NotificationType notificationType;

    private NotificationStatus status;

    private String errorMessage;

    private LocalDateTime createdAt;
}
