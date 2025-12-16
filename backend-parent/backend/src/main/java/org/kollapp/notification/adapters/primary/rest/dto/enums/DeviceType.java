package org.kollapp.notification.adapters.primary.rest.dto.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import org.kollapp.notification.application.exception.InvalidDeviceTypeException;

/**
 * Enumeration of supported device types for push notifications.
 */
public enum DeviceType {
    ANDROID,
    IOS,
    WEB;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static DeviceType fromString(String value) {
        if (value == null) {
            return null;
        }
        for (DeviceType type : DeviceType.values()) {
            if (type.name().equals(value)) {
                return type;
            }
        }
        throw new InvalidDeviceTypeException();
    }
}
