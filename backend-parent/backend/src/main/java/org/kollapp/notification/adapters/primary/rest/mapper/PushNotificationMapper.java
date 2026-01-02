package org.kollapp.notification.adapters.primary.rest.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import org.kollapp.notification.adapters.primary.rest.dto.PushNotificationTO;
import org.kollapp.notification.application.model.entities.PushNotification;

/**
 * MapStruct mapper for push notification entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface PushNotificationMapper {
    /**
     * Convert a push notification entity to a transfer object.
     *
     * @param notification The push notification entity
     * @return The transfer object
     */
    PushNotificationTO toTO(PushNotification notification);

    /**
     * Convert a list of push notification entities to transfer objects.
     *
     * @param notifications The list of push notification entities
     * @return The list of transfer objects
     */
    List<PushNotificationTO> toTOs(List<PushNotification> notifications);
}
