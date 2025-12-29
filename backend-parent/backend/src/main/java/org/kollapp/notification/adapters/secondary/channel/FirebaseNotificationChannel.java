package org.kollapp.notification.adapters.secondary.channel;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;

import org.kollapp.notification.application.exception.NotificationDataSerializationException;
import org.kollapp.notification.application.exception.PushNotificationException;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.NotificationStatus;
import org.kollapp.notification.application.port.PushNotificationChannel;
import org.kollapp.notification.application.repository.DeviceTokenRepository;

/**
 * Firebase Cloud Messaging implementation of push notification channel.
 */
@Slf4j
@Component
@SecondaryAdapter
@ConditionalOnBean(FirebaseMessaging.class)
public class FirebaseNotificationChannel implements PushNotificationChannel {

    @Autowired
    private FirebaseMessaging firebaseMessaging;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Override
    public PushNotification send(DeviceToken deviceToken, String title, String body, Map<String, String> data) {
        log.debug("Sending notification via Firebase to token: {}", deviceToken.getToken());

        PushNotification notification = PushNotification.builder()
                .userId(deviceToken.getUserId())
                .title(title)
                .body(body)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            if (data != null) {
                notification.setData(objectMapper.writeValueAsString(data));
            }
        } catch (JsonProcessingException e) {
            throw new NotificationDataSerializationException();
        }

        try {
            Notification fcmNotification =
                    Notification.builder().setTitle(title).setBody(body).build();

            Message.Builder messageBuilder =
                    Message.builder().setToken(deviceToken.getToken()).setNotification(fcmNotification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String messageId = firebaseMessaging.send(message);

            log.debug("Successfully sent notification via Firebase, messageId: {}", messageId);
            notification.setStatus(NotificationStatus.SENT);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send notification via Firebase: {}", e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());

            if (isInvalidTokenError(e)) {
                deactivateToken(deviceToken);
            }
        } catch (Exception e) {
            log.error("Unexpected error sending notification via Firebase: {}", e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            throw new PushNotificationException();
        }

        return notification;
    }

    @Override
    public boolean supports(DeviceToken deviceToken) {
        // Firebase supports both iOS and Android
        return deviceToken.getDeviceType() != null;
    }

    @Override
    public String getChannelName() {
        return "firebase";
    }

    private boolean isInvalidTokenError(FirebaseMessagingException e) {
        MessagingErrorCode errorCode = e.getMessagingErrorCode();
        return errorCode != null
                && (errorCode.name().equals("UNREGISTERED") || errorCode.name().equals("INVALID_ARGUMENT"));
    }

    private void deactivateToken(DeviceToken deviceToken) {
        log.info("Deactivating invalid device token: {}", deviceToken.getToken());
        deviceToken.setActive(false);
        deviceTokenRepository.save(deviceToken);
    }
}
