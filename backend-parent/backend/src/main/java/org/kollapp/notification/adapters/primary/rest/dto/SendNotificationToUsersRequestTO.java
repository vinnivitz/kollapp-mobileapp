package org.kollapp.notification.adapters.primary.rest.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transfer object for sending push notification to multiple users request.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SendNotificationToUsersRequestTO {
    @NotEmpty(message = "validation.notification.user-ids.required")
    private List<Long> userIds;

    @NotBlank(message = "validation.notification.title.required")
    private String title;

    @NotBlank(message = "validation.notification.body.required")
    private String body;

    private Map<String, String> data;
}
