package org.kollapp.notification.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.adapters.primary.rest.dto.enums.DeviceType;

/**
 * Transfer object for device token response.
 */
@Getter
@Setter
@NoArgsConstructor
public class DeviceTokenTO {
    @NotNull
    private long id;

    @NotNull
    private String token;

    @NotNull
    private DeviceType deviceType;

    @NotNull
    private String deviceName;

    @NotNull
    private boolean active;
}
