package org.kollapp.notification.adapters.primary.listener;

import lombok.RequiredArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.domain.events.SendNotificationToUsersEvent;

/**
 * Listener for SendNotificationToUsersEvent to send push notifications to
 * multiple users.
 */
@PrimaryAdapter
@Service
@RequiredArgsConstructor
public class SendNotificationToUsersListener {

    private final PushNotificationService pushNotificationService;

    @EventListener
    public void on(SendNotificationToUsersEvent event) {
        pushNotificationService.sendNotificationToUsers(
                event.getUserIds(), event.getTitle(), event.getBody(), event.getNotificationType(), event.getRoute());
    }
}
