package org.kollapp.organization.adapters.primary.listener;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.port.secondary.NotificationPublisher;
import org.kollapp.notification.application.service.NotificationRouteBuilder;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.organization.application.model.ActivityDeletedEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends push notifications when an activity is deleted.
 * Implements event-driven notification triggering.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class ActivityDeletedNotificationListener implements ApplicationListener<ActivityDeletedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final OrganizationService organizationService;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(ActivityDeletedEvent event) {
        List<Long> userIds = organizationService.getAllMemberUserIds(event.getOrganizationId());

        String route = routeBuilder.toOrganizationPage();
        String title = messageUtil.getMessage("notification.activity.deleted.title");
        String body = messageUtil.getMessage("notification.activity.deleted.body", event.getActivityName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                userIds, title, body, NotificationType.ACTIVITIES, route);
    }
}
