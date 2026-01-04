package org.kollapp.organization.adapters.primary.listener;

import java.util.List;
import java.util.stream.Collectors;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.publisher.NotificationPublisher;
import org.kollapp.notification.application.util.NotificationRouteBuilder;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.repository.PersonOfOrganizationRepository;
import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUserDeletedEvent;

/**
 * Listener that sends push notifications to organization members when a user deletes their account.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class UserDeletedNotificationListener implements ApplicationListener<KollappUserDeletedEvent> {

    private final NotificationPublisher notificationPublisher;

    private final PersonOfOrganizationRepository personOfOrganizationRepository;

    private final OrganizationService organizationService;

    private final MessageUtil messageUtil;

    private final NotificationRouteBuilder routeBuilder;

    @Override
    public void onApplicationEvent(KollappUserDeletedEvent event) {
        long deletedUserId = event.getUserId();
        String username = event.getUsername();

        List<PersonOfOrganization> organizations = personOfOrganizationRepository.findByUserId(deletedUserId);

        if (organizations.isEmpty()) {
            return;
        }

        // For each organization, notify all other members
        for (PersonOfOrganization personOfOrganization : organizations) {
            long organizationId = personOfOrganization.getOrganization().getId();
            String organizationName = personOfOrganization.getOrganization().getName();

            List<Long> memberUserIds = organizationService.getAllMemberUserIds(organizationId).stream()
                    .filter(userId -> userId != deletedUserId)
                    .collect(Collectors.toList());

            if (memberUserIds.isEmpty()) {
                continue;
            }

            String route = routeBuilder.toOrganizationMembers();
            String title = messageUtil.getMessage("notification.user.deleted.title");
            String body = messageUtil.getMessage("notification.user.deleted.body", username, organizationName);

            notificationPublisher.publishSendNotificationToUsersEvent(
                    memberUserIds, title, body, NotificationType.MEMBERSHIP_CHANGES, route);
        }
    }
}
