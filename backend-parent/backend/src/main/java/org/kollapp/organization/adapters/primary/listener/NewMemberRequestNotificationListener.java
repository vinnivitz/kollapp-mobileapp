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

    @Autowired
    private MessageUtil messageUtil;

    @Override
    public void onApplicationEvent(NewMemberRequestEvent event) {
        List<Long> managerUserIds = organizationService.getAllManagerUserIds(event.getOrganizationId());

        String route = "/organizations/" + event.getOrganizationId() + "/members";
        String title = messageUtil.getMessage("notification.membership.new-request.title");
        String body = messageUtil.getMessage(
                "notification.membership.new-request.body", event.getUsername(), event.getOrganizationName());

        notificationPublisher.publishSendNotificationToUsersEvent(
                managerUserIds, title, body, NotificationType.MEMBERSHIP_CHANGES, route);
    }
}
