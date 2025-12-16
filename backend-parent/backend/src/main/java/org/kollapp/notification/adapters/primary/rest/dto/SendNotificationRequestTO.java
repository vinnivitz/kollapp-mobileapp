package org.kollapp.notification.adapters.primary.rest.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transfer object for sending push notification request.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SendNotificationRequestTO {
    @NotBlank(message = "validation.notification.title.required")
    private String title;

    @NotBlank(message = "validation.notification.body.required")
    private String body;

    private Map<String, String> data;
}
