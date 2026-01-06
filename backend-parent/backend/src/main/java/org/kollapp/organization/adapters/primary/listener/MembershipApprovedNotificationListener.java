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
import org.kollapp.organization.application.model.MembershipApprovedEvent;

/**
 * Listener that sends a notification when a membership is approved.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class MembershipApprovedNotificationListener implements ApplicationListener<MembershipApprovedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(MembershipApprovedEvent event) {
        String route = routeBuilder.toOrganizationPage();
        String title = messageUtil.getMessage("notification.membership.approved.title");
        String body = messageUtil.getMessage("notification.membership.approved.body", event.getOrganizationName());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.MEMBERSHIP_STATUS, route);
    }
}
