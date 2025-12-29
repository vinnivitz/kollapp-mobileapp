package org.kollapp.notification.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

import org.kollapp.notification.config.properties.FirebaseProperties;

/**
 * Configuration for Firebase Cloud Messaging.
 */
@Slf4j
@Configuration
public class FirebaseConfig {
    private final FirebaseProperties firebaseProperties;

    public FirebaseConfig(FirebaseProperties firebaseProperties) {
        this.firebaseProperties = firebaseProperties;
    }

    /**
     * Initialize Firebase App with credentials.
     *
     * @return FirebaseApp instance
     * @throws IOException if credentials file cannot be read
     */
    @Bean
    @ConditionalOnProperty(prefix = "kollapp.firebase", name = "enabled", havingValue = "true")
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            String credentialsPath = firebaseProperties.getCredentialsPath();
            InputStream serviceAccount = new FileInputStream(credentialsPath);

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

            String projectId = null;
            if (credentials instanceof ServiceAccountCredentials serviceAccountCredentials) {
                projectId = serviceAccountCredentials.getProjectId();
            }

            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder().setCredentials(credentials);

            if (projectId != null) {
                optionsBuilder.setProjectId(projectId);
            }

            FirebaseOptions options = optionsBuilder.build();
            FirebaseApp app = FirebaseApp.initializeApp(options);

            return app;
        }
        return FirebaseApp.getInstance();
    }

    /**
     * Create FirebaseMessaging bean for sending push notifications.
     *
     * @param firebaseApp The Firebase app instance
     * @return FirebaseMessaging instance
     */
    @Bean
    @ConditionalOnProperty(prefix = "kollapp.firebase", name = "enabled", havingValue = "true")
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
