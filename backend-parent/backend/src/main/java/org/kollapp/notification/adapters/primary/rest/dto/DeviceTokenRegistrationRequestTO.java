package org.kollapp.notification.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.adapters.primary.rest.dto.enums.DeviceType;

/**
 * Transfer object for device token registration request.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceTokenRegistrationRequestTO {
    @NotBlank(message = "validation.device-token.required")
    private String token;

    @NotNull(message = "validation.device-type.required")
    private DeviceType deviceType;
}
