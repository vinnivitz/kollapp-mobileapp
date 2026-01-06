package org.kollapp.notification.adapters.secondary.db.jpa;

import org.kollapp.notification.adapters.secondary.db.jpa.entities.DeviceTokenEntity;
import org.kollapp.notification.adapters.secondary.db.jpa.entities.PushNotificationEntity;
import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.entities.PushNotification;

public final class NotificationJpaMapper {

    private NotificationJpaMapper() {}

    public static DeviceTokenEntity toEntity(DeviceToken domain) {
        if (domain == null) {
            return null;
        }

        return DeviceTokenEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .token(domain.getToken())
                .deviceType(domain.getDeviceType())
                .deviceName(domain.getDeviceName())
                .active(domain.isActive())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    public static DeviceToken toDomain(DeviceTokenEntity entity) {
        if (entity == null) {
            return null;
        }

        return DeviceToken.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .token(entity.getToken())
                .deviceType(entity.getDeviceType())
                .deviceName(entity.getDeviceName())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static PushNotificationEntity toEntity(PushNotification domain) {
        if (domain == null) {
            return null;
        }

        return PushNotificationEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .title(domain.getTitle())
                .body(domain.getBody())
                .data(domain.getData())
                .notificationType(domain.getNotificationType())
                .status(domain.getStatus())
                .errorMessage(domain.getErrorMessage())
                .createdAt(domain.getCreatedAt())
                .build();
    }

    public static PushNotification toDomain(PushNotificationEntity entity) {
        if (entity == null) {
            return null;
        }

        return PushNotification.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .body(entity.getBody())
                .data(entity.getData())
                .notificationType(entity.getNotificationType())
                .status(entity.getStatus())
                .errorMessage(entity.getErrorMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
