package org.kollapp.notification.adapters.infrastructure;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.application.port.secondary.DeviceTokenRepository;
import org.kollapp.notification.application.port.secondary.PushNotificationChannel;
import org.kollapp.notification.application.port.secondary.PushNotificationRepository;
import org.kollapp.notification.application.service.DefaultPushNotificationService;

@Configuration
@EnableTransactionManagement
public class PushNotificationServiceConfig {

    @Bean
    public PushNotificationService pushNotificationService(
            DeviceTokenRepository deviceTokenRepository,
            PushNotificationRepository pushNotificationRepository,
            List<PushNotificationChannel> notificationChannels) {
        return new DefaultPushNotificationService(
                deviceTokenRepository, pushNotificationRepository, notificationChannels);
    }
}
