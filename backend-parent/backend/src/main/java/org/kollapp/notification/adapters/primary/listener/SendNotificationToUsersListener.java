package org.kollapp.notification.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.SendNotificationToUsersEvent;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Listener for SendNotificationToUsersEvent to send push notifications to multiple users.
 */
@PrimaryAdapter
@Service
@Slf4j
public class SendNotificationToUsersListener implements ApplicationListener<SendNotificationToUsersEvent> {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Override
    public void onApplicationEvent(SendNotificationToUsersEvent event) {
        try {
            pushNotificationService.sendNotificationToUsers(
                    event.getUserIds(),
                    event.getTitle(),
                    event.getBody(),
                    event.getNotificationType(),
                    event.getData());
        } catch (Exception e) {
            log.error("[Notification] Failed to send notification to users: {}", e.getMessage());
        }
    }
}
