package org.kollapp.organization.adapters.primary.listener;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.publisher.NotificationPublisher;
import org.kollapp.organization.application.model.NewMemberRequestEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends a notification to managers when a new member requests to join.
 * Channel: MEMBERSHIP_CHANGES - Notifications about other people joining the organization.
 */
@PrimaryAdapter
@Service
@Slf4j
public class NewMemberRequestNotificationListener implements ApplicationListener<NewMemberRequestEvent> {

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Autowired
    private OrganizationService organizationService;

    @Override
    public void onApplicationEvent(NewMemberRequestEvent event) {
        log.info(
                "[Organization] Received domain event: NewMemberRequestEvent for user {} in organization {}",
                event.getUserId(),
                event.getOrganizationId());

        // Get all managers of the organization
        List<Long> managerUserIds = organizationService.getAllManagerUserIds(event.getOrganizationId());

        Map<String, String> data = new HashMap<>();
        data.put("type", "membership_request");
        data.put("organizationId", String.valueOf(event.getOrganizationId()));
        data.put("organizationName", event.getOrganizationName());
        data.put("userId", String.valueOf(event.getUserId()));
        data.put("username", event.getUsername());

        String title = "New Membership Request";
        String body = String.format("%s wants to join %s", event.getUsername(), event.getOrganizationName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                managerUserIds, title, body, NotificationType.MEMBERSHIP_CHANGES, data);
    }
}
