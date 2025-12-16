package org.kollapp.notification.adapters.primary.rest.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import org.kollapp.notification.adapters.primary.rest.dto.DeviceTokenTO;
import org.kollapp.notification.application.model.entities.DeviceToken;

/**
 * MapStruct mapper for device token entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface DeviceTokenMapper {
    /**
     * Convert a device token entity to a transfer object.
     *
     * @param deviceToken The device token entity
     * @return The transfer object
     */
    DeviceTokenTO toTO(DeviceToken deviceToken);

    /**
     * Convert a list of device token entities to transfer objects.
     *
     * @param deviceTokens The list of device token entities
     * @return The list of transfer objects
     */
    List<DeviceTokenTO> toTOs(List<DeviceToken> deviceTokens);
}
