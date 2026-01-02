package org.kollapp.notification.adapters.primary.listener;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.events.SendNotificationToUsersEvent;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Listener for SendNotificationToUsersEvent to send push notifications to
 * multiple users.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class SendNotificationToUsersListener implements ApplicationListener<SendNotificationToUsersEvent> {

    private final PushNotificationService pushNotificationService;

    @Override
    public void onApplicationEvent(SendNotificationToUsersEvent event) {
        pushNotificationService.sendNotificationToUsers(
                event.getUserIds(), event.getTitle(), event.getBody(), event.getNotificationType(), event.getRoute());
    }
}
