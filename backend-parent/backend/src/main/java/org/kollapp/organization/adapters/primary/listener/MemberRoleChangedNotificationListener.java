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
import org.kollapp.organization.application.model.MemberRoleChangedEvent;

/**
 * Listener that sends a notification when a member's role is changed.
 * Channel: MEMBERSHIP_STATUS - Personal notification about the user's own membership status.
 */
@PrimaryAdapter
@Service
@Slf4j
public class MemberRoleChangedNotificationListener implements ApplicationListener<MemberRoleChangedEvent> {

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Override
    public void onApplicationEvent(MemberRoleChangedEvent event) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "role_changed");
        data.put("organizationId", String.valueOf(event.getOrganizationId()));
        data.put("organizationName", event.getOrganizationName());
        data.put("newRole", event.getNewRole().name());

        String roleDisplay = event.getNewRole().name().replace("ROLE_ORGANIZATION_", "");
        String title = "Your Role Has Changed";
        String body = String.format("You are now a %s in %s", roleDisplay, event.getOrganizationName());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.MEMBERSHIP_STATUS, data);
    }
}
