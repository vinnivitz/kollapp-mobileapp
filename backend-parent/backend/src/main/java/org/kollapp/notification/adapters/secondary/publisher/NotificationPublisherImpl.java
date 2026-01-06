package org.kollapp.notification.adapters.secondary.publisher;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.port.secondary.NotificationPublisher;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.notification.domain.events.SendNotificationEvent;
import org.kollapp.notification.domain.events.SendNotificationToUsersEvent;

/**
 * Implementation of NotificationPublisher that publishes notification events.
 */
@SecondaryAdapter
@Service
@RequiredArgsConstructor
public class NotificationPublisherImpl implements NotificationPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishSendNotificationEvent(
            long userId, String title, String body, NotificationType notificationType, String route) {
        SendNotificationEvent event = new SendNotificationEvent(userId, title, body, notificationType, route);
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    public void publishSendNotificationToUsersEvent(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {
        SendNotificationToUsersEvent event =
                new SendNotificationToUsersEvent(userIds, title, body, notificationType, route);
        applicationEventPublisher.publishEvent(event);
    }
}
