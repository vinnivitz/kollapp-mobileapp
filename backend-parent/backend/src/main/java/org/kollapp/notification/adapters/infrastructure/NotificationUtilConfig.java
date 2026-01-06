package org.kollapp.notification.adapters.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.kollapp.notification.application.service.NotificationRouteBuilder;

@Configuration
public class NotificationUtilConfig {

    @Bean
    public NotificationRouteBuilder notificationRouteBuilder() {
        return new NotificationRouteBuilder();
    }
}
