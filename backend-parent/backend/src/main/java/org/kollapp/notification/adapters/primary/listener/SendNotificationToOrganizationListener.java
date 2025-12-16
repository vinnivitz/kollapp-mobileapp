package org.kollapp.notification.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.SendNotificationToOrganizationEvent;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Listener for SendNotificationToOrganizationEvent to send push notifications to all organization members.
 */
@PrimaryAdapter
@Service
@Slf4j
public class SendNotificationToOrganizationListener
        implements ApplicationListener<SendNotificationToOrganizationEvent> {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Override
    public void onApplicationEvent(SendNotificationToOrganizationEvent event) {
        log.info(
                "[Notification] Received domain event: SendNotificationToOrganizationEvent for organization {}",
                event.getOrganizationId());
        try {
            if (event.getUserIds() == null || event.getUserIds().isEmpty()) {
                log.warn(
                        "[Notification] No members found for organization {}, skipping notification",
                        event.getOrganizationId());
                return;
            }

            pushNotificationService.sendNotificationToUsers(
                    event.getUserIds(), event.getTitle(), event.getBody(), event.getData());
        } catch (Exception e) {
            log.error(
                    "[Notification] Failed to send notification to organization {}: {}",
                    event.getOrganizationId(),
                    e.getMessage());
        }
    }
}
