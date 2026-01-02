package org.kollapp.notification.adapters.secondary.publisher;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.model.events.SendNotificationEvent;
import org.kollapp.notification.application.model.events.SendNotificationToUsersEvent;
import org.kollapp.notification.application.publisher.NotificationPublisher;

/**
 * Implementation of NotificationPublisher that publishes notification events.
 */
@SecondaryAdapter
@Service
@Slf4j
public class NotificationPublisherImpl implements NotificationPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishSendNotificationEvent(
            long userId, String title, String body, NotificationType notificationType, String route) {
        SendNotificationEvent event = new SendNotificationEvent(this, userId, title, body, notificationType, route);
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    public void publishSendNotificationToUsersEvent(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {
        SendNotificationToUsersEvent event =
                new SendNotificationToUsersEvent(this, userIds, title, body, notificationType, route);
        applicationEventPublisher.publishEvent(event);
    }
}
