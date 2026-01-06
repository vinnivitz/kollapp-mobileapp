package org.kollapp.notification.adapters.infrastructure;

import java.util.List;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.kollapp.notification.application.port.secondary.DeviceTokenRepository;
import org.kollapp.notification.application.port.secondary.PushNotificationChannel;
import org.kollapp.notification.application.port.secondary.PushNotificationRepository;
import org.kollapp.notification.application.service.DefaultPushNotificationService;

/**
 * Infrastructure factory that creates application services.
 * Uses constructor injection with Spring-provided implementations.
 */
@Configuration
@SecondaryAdapter
public class PushNotificationServiceFactory {

    /**
     * Creates the core notification service.
     * Spring will inject the repository implementations automatically.
     */
    @Bean
    public DefaultPushNotificationService corePushNotificationService(
            DeviceTokenRepository deviceTokenRepository,
            PushNotificationRepository pushNotificationRepository,
            List<PushNotificationChannel> notificationChannels) {
        return new DefaultPushNotificationService(
                deviceTokenRepository, pushNotificationRepository, notificationChannels);
    }
}
