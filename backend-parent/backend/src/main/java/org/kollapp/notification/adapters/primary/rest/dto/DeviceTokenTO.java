package org.kollapp.notification.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.adapters.primary.rest.dto.enums.DeviceType;

/**
 * Transfer object for device token response.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceTokenTO {
    private Long id;

    private String token;

    private DeviceType deviceType;

    private boolean active;
}
