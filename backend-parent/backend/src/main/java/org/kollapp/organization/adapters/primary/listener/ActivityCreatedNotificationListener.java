package org.kollapp.organization.adapters.primary.listener;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
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

    @Autowired
    private MessageUtil messageUtil;

    @Override
    public void onApplicationEvent(ActivityCreatedEvent event) {
        List<Long> userIds = organizationService.getAllMemberUserIds(event.getOrganizationId());

        String route = "/organizations/" + event.getOrganizationId() + "/activities/" + event.getActivityId();
        String title = messageUtil.getMessage("notification.activity.created.title");
        String body = messageUtil.getMessage("notification.activity.created.body", event.getActivityName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                userIds, title, body, NotificationType.ACTIVITIES, route);
    }
}
