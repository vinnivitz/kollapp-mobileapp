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
import org.kollapp.organization.application.model.PostingCreatedEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends push notifications when a new posting is created.
 * Implements event-driven notification triggering.
 */
@Component
@Slf4j
@AllArgsConstructor
public class PostingCreatedNotificationListener implements ApplicationListener<PostingCreatedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final OrganizationService organizationService;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(PostingCreatedEvent event) {
        List<Long> userIds = organizationService.getAllMemberUserIds(event.getOrganizationId());

        String route;
        if (event.getActivityId() != null) {
            route = routeBuilder.toActivity(event.getActivityId());
        } else {
            route = routeBuilder.toOrganizationPage();
        }

        String title = messageUtil.getMessage("notification.posting.created.title");
        String body = messageUtil.getMessage("notification.posting.created.body", event.getPostingPurpose());

        notificationPublisher.publishSendNotificationToUsersEvent(
                userIds, title, body, NotificationType.FINANCES, route);
    }
}
