package org.kollapp.user.adapters.primary.listener;

import java.util.HashMap;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.publisher.NotificationPublisher;
import org.kollapp.user.application.model.KollappUserUpdatedEvent;

/**
 * Listener that sends a notification when a user's profile is updated.
 */
@PrimaryAdapter
@Service
@Slf4j
public class UserUpdatedNotificationListener implements ApplicationListener<KollappUserUpdatedEvent> {

    @Autowired
    private NotificationPublisher notificationPublisher;

    @Override
    public void onApplicationEvent(KollappUserUpdatedEvent event) {
        log.info(
                "[User] Received domain event: KollappUserUpdatedEvent for user {}, sending notification",
                event.getUserId());

        // Send notification to the user about their profile update
        Map<String, String> data = new HashMap<>();
        data.put("userId", String.valueOf(event.getUserId()));
        data.put("type", "profile_updated");

        String title = "Profile Updated";
        String body = String.format("Hi %s, your profile has been successfully updated!", event.getUsername());

        notificationPublisher.publishSendNotificationEvent(
                event.getUserId(), title, body, NotificationType.GENERAL, data);
    }
}
