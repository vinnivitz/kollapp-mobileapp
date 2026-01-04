package org.kollapp.organization.adapters.primary.listener;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.publisher.NotificationPublisher;
import org.kollapp.notification.application.util.NotificationRouteBuilder;
import org.kollapp.organization.application.model.NewMemberRequestEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends a notification to managers when a new member requests to join.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class NewMemberRequestNotificationListener implements ApplicationListener<NewMemberRequestEvent> {

    private final NotificationPublisher notificationPublisher;

    private final OrganizationService organizationService;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(NewMemberRequestEvent event) {
        List<Long> managerIds = organizationService.getAllManagerUserIds(event.getOrganizationId());

        String route = routeBuilder.toOrganizationMembers();
        String title = messageUtil.getMessage("notification.membership.new-request.title");
        String body = messageUtil.getMessage(
                "notification.membership.new-request.body", event.getUsername(), event.getOrganizationName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                managerIds, title, body, NotificationType.MEMBERSHIP_CHANGES, route);
    }
}
