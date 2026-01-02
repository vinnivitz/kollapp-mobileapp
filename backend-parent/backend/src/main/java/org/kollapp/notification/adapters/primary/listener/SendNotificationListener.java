package org.kollapp.notification.adapters.primary.listener;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.events.SendNotificationEvent;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Listener for SendNotificationEvent to send push notifications to a single
 * user.
 */
@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class SendNotificationListener implements ApplicationListener<SendNotificationEvent> {

    private final PushNotificationService pushNotificationService;

    @Override
    public void onApplicationEvent(SendNotificationEvent event) {
        pushNotificationService.sendNotificationToUser(
                event.getUserId(), event.getTitle(), event.getBody(), event.getNotificationType(), event.getRoute());
    }
}
