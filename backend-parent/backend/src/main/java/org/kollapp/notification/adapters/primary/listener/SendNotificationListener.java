package org.kollapp.notification.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.SendNotificationEvent;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Listener for SendNotificationEvent to send push notifications to a single user.
 */
@PrimaryAdapter
@Service
@Slf4j
public class SendNotificationListener implements ApplicationListener<SendNotificationEvent> {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Override
    public void onApplicationEvent(SendNotificationEvent event) {
        try {
            pushNotificationService.sendNotificationToUser(
                    event.getUserId(), event.getTitle(), event.getBody(), event.getNotificationType(), event.getData());
        } catch (Exception e) {
            log.error("[Notification] Failed to send notification to user {}: {}", event.getUserId(), e.getMessage());
        }
    }
}
