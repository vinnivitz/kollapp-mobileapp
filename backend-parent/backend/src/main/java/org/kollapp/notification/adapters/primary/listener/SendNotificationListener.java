package org.kollapp.notification.adapters.primary.listener;

import lombok.RequiredArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.domain.events.SendNotificationEvent;

/**
 * Listener for SendNotificationEvent to send push notifications to a single
 * user.
 */
@PrimaryAdapter
@Service
@RequiredArgsConstructor
public class SendNotificationListener {

    private final PushNotificationService pushNotificationService;

    @EventListener
    public void on(SendNotificationEvent event) {
        pushNotificationService.sendNotificationToUser(
                event.getUserId(), event.getTitle(), event.getBody(), event.getNotificationType(), event.getRoute());
    }
}
