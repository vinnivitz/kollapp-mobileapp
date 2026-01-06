package org.kollapp.notification.domain.entities;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.domain.enums.DeviceType;

/**
 * Entity representing a device token for push notifications.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceToken {
    private Long id;

    private long userId;

    private String token;

    private DeviceType deviceType;

    private String deviceName;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
