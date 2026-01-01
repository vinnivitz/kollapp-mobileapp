package org.kollapp.organization.adapters.primary.listener;

import java.util.HashMap;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

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

    @Override
    public void onApplicationEvent(MembershipApprovedEvent event) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "membership_approved");
        data.put("organizationId", String.valueOf(event.getOrganizationId()));
        data.put("organizationName", event.getOrganizationName());

        String title = "Membership Approved";
        String body = String.format("Your membership to %s has been approved!", event.getOrganizationName());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.MEMBERSHIP_STATUS, data);
    }
}
