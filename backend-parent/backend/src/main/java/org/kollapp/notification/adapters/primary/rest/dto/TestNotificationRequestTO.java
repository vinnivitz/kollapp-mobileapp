package org.kollapp.notification.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Request DTO for testing push notifications.
 */
@Getter
@Setter
@NoArgsConstructor
public class TestNotificationRequestTO {

    @NotBlank(message = "validation.notification.title.required")
    private String title;

    @NotBlank(message = "validation.notification.body.required")
    private String body;

    @NotNull(message = "validation.notification.type.required")
    private NotificationType notificationType;

    private String route;
}
