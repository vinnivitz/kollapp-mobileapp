package org.kollapp.notification.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
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
public class DeviceTokenRegistrationRequestTO {
    @NotBlank(message = "validation.device-token.required")
    private String token;

    @NotNull(message = "validation.device-type.required")
    private DeviceType deviceType;

    @NotBlank(message = "validation.device-name.required")
    @Size(max = 100, message = "validation.device-name.maxlength")
    private String deviceName;
}
