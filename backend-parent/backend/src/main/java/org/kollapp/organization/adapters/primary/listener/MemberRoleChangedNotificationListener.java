package org.kollapp.organization.adapters.primary.listener;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.port.secondary.NotificationPublisher;
import org.kollapp.notification.application.service.NotificationRouteBuilder;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.organization.application.model.MemberRoleChangedEvent;

/**
 * Listener that sends a notification when a member's role is changed.
 * Channel: MEMBERSHIP_STATUS - Personal notification about the user's own membership status.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class MemberRoleChangedNotificationListener implements ApplicationListener<MemberRoleChangedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(MemberRoleChangedEvent event) {
        String route = routeBuilder.toOrganizationPage();
        String roleDisplay = event.getNewRole().name().replace("ROLE_ORGANIZATION_", "");
        String title = messageUtil.getMessage("notification.membership.role-changed.title");
        String body = messageUtil.getMessage(
                "notification.membership.role-changed.body", roleDisplay, event.getOrganizationName());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.MEMBERSHIP_STATUS, route);
    }
}
