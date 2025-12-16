package org.kollapp.notification.adapters.secondary.publisher;

import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.SendNotificationEvent;
import org.kollapp.notification.application.model.SendNotificationToOrganizationEvent;
import org.kollapp.notification.application.model.SendNotificationToUsersEvent;
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
    public void publishSendNotificationEvent(Long userId, String title, String body, Map<String, String> data) {
        log.info("[Notification] Publishing domain event: SendNotificationEvent for user {}", userId);
        SendNotificationEvent event = new SendNotificationEvent(this, userId, title, body, data);
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    public void publishSendNotificationToUsersEvent(
            List<Long> userIds, String title, String body, Map<String, String> data) {
        log.info("[Notification] Publishing domain event: SendNotificationToUsersEvent for {} users", userIds.size());
        SendNotificationToUsersEvent event = new SendNotificationToUsersEvent(this, userIds, title, body, data);
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    public void publishSendNotificationToOrganizationEvent(
            Long organizationId, List<Long> userIds, String title, String body, Map<String, String> data) {
        log.info(
                "[Notification] Publishing domain event: SendNotificationToOrganizationEvent for organization {} with {} users",
                organizationId,
                userIds.size());
        SendNotificationToOrganizationEvent event =
                new SendNotificationToOrganizationEvent(this, organizationId, userIds, title, body, data);
        applicationEventPublisher.publishEvent(event);
    }
}
