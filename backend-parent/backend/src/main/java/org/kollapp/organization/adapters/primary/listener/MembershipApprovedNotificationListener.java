package org.kollapp.organization.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.publisher.NotificationPublisher;
import org.kollapp.organization.application.model.MembershipApprovedEvent;

/**
 * Listener that sends a notification when a membership is approved.
 * Channel: MEMBERSHIP_STATUS - Personal notification about the user's own membership status.
 */
@PrimaryAdapter
@Service
@Slf4j
public class MembershipApprovedNotificationListener implements ApplicationListener<MembershipApprovedEvent> {

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Autowired
    private MessageUtil messageUtil;

    @Override
    public void onApplicationEvent(MembershipApprovedEvent event) {
        String route = "/organizations/" + event.getOrganizationId();
        String title = messageUtil.getMessage("notification.membership.approved.title");
        String body = messageUtil.getMessage("notification.membership.approved.body", event.getOrganizationName());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.MEMBERSHIP_STATUS, route);
    }
}
