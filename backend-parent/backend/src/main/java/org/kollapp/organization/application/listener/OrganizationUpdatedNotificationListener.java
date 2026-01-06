package org.kollapp.organization.application.listener;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.port.secondary.NotificationPublisher;
import org.kollapp.notification.application.service.NotificationRouteBuilder;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.organization.application.model.OrganizationUpdatedEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends push notifications when an organization is updated.
 * Implements event-driven notification triggering.
 */
@Component
@Slf4j
@AllArgsConstructor
public class OrganizationUpdatedNotificationListener implements ApplicationListener<OrganizationUpdatedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final OrganizationService organizationService;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(OrganizationUpdatedEvent event) {
        List<Long> userIds = organizationService.getAllMemberUserIds(event.getOrganizationId());

        String route = routeBuilder.toOrganizationPage();
        String title = messageUtil.getMessage("notification.organization.updated.title");
        String body = messageUtil.getMessage("notification.organization.updated.body", event.getOrganizationName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                userIds, title, body, NotificationType.GENERAL, route);
    }
}
