package org.kollapp.notification.adapters.infrastructure.properties;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Firebase Cloud Messaging.
 */
@Component
@ConfigurationProperties(prefix = "kollapp.firebase")
@Getter
@Setter
public class FirebaseProperties {
    /**
     * Whether Firebase is enabled.
     */
    private boolean enabled = false;

    /**
     * Path to the Firebase service account credentials JSON file.
     */
    private String credentialsPath = "firebase-service-account.json";
}
