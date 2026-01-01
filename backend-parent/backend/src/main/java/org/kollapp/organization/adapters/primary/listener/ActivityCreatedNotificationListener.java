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
import org.kollapp.organization.application.model.ActivityCreatedEvent;
import org.kollapp.organization.application.service.OrganizationService;

/**
 * Listener that sends push notifications when a new activity is created.
 * Implements event-driven notification triggering.
 */
@PrimaryAdapter
@Service
@Slf4j
public class ActivityCreatedNotificationListener implements ApplicationListener<ActivityCreatedEvent> {

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Autowired
    private OrganizationService organizationService;

    @Override
    public void onApplicationEvent(ActivityCreatedEvent event) {
        // Get user IDs from the organization
        List<Long> userIds = organizationService.getAllMemberUserIds(event.getOrganizationId());

        // Send notification to all organization members about the new activity
        Map<String, String> data = new HashMap<>();
        data.put("activityId", String.valueOf(event.getActivityId()));
        data.put("organizationId", String.valueOf(event.getOrganizationId()));
        data.put("type", "activity_created");

        String title = "New Activity Created";
        String body = String.format("A new activity '%s' has been created!", event.getActivityName());

        notificationPublisher.publishSendNotificationToOrganizationEvent(
                event.getOrganizationId(), userIds, title, body, NotificationType.ACTIVITIES, data);
    }
}
