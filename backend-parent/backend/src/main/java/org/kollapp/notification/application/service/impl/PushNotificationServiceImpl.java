package org.kollapp.notification.application.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;

import org.kollapp.notification.application.exception.DeviceTokenNotFoundException;
import org.kollapp.notification.application.exception.FirebaseMessagingNotConfiguredException;
import org.kollapp.notification.application.exception.NoActiveDeviceTokenFoundException;
import org.kollapp.notification.application.exception.NotificationDataSerializationException;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.model.enums.NotificationStatus;
import org.kollapp.notification.application.repository.DeviceTokenRepository;
import org.kollapp.notification.application.repository.PushNotificationRepository;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Implementation of PushNotificationService using Firebase Cloud Messaging.
 */
@Slf4j
@Service
@Transactional
public class PushNotificationServiceImpl implements PushNotificationService {
    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private PushNotificationRepository pushNotificationRepository;

    @Autowired(required = false)
    private FirebaseMessaging firebaseMessaging;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public DeviceToken registerDeviceToken(Long userId, String token, DeviceType deviceType) {
        Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(token);

        if (existingToken.isPresent()) {
            DeviceToken deviceToken = existingToken.get();
            deviceToken.setUserId(userId);
            deviceToken.setDeviceType(deviceType);
            deviceToken.setActive(true);
            return deviceTokenRepository.save(deviceToken);
        }

        DeviceToken deviceToken = DeviceToken.builder()
                .userId(userId)
                .token(token)
                .deviceType(deviceType)
                .active(true)
                .build();

        return deviceTokenRepository.save(deviceToken);
    }

    @Override
    public void unregisterDeviceToken(String token) {
        DeviceToken deviceToken =
                deviceTokenRepository.findByToken(token).orElseThrow(() -> new DeviceTokenNotFoundException());

        deviceToken.setActive(false);
        deviceTokenRepository.save(deviceToken);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> getUserDeviceTokens(Long userId) {
        return deviceTokenRepository.findActiveByUserId(userId);
    }

    @Override
    public void sendNotificationToUser(Long userId, String title, String body, Map<String, String> data) {
        List<DeviceToken> deviceTokens = deviceTokenRepository.findActiveByUserId(userId);

        if (deviceTokens.isEmpty()) {
            throw new NoActiveDeviceTokenFoundException();
        }

        for (DeviceToken deviceToken : deviceTokens) {
            CompletableFuture.runAsync(() -> sendNotificationAsync(userId, title, body, data, deviceToken.getToken()));
        }
    }

    @Override
    public void sendNotificationToUsers(List<Long> userIds, String title, String body, Map<String, String> data) {
        for (Long userId : userIds) {
            sendNotificationToUser(userId, title, body, data);
        }
    }

    @Override
    public void sendNotificationToToken(String token, String title, String body, Map<String, String> data) {
        DeviceToken deviceToken =
                deviceTokenRepository.findByToken(token).orElseThrow(() -> new DeviceTokenNotFoundException());

        sendNotificationAsync(deviceToken.getUserId(), title, body, data, token);
    }

    private void sendNotificationAsync(Long userId, String title, String body, Map<String, String> data, String token) {
        if (firebaseMessaging == null) {
            throw new FirebaseMessagingNotConfiguredException();
        }

        PushNotification notification = PushNotification.builder()
                .userId(userId)
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

            Message.Builder messageBuilder = Message.builder().setToken(token).setNotification(fcmNotification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            firebaseMessaging.send(message);

            notification.setStatus(NotificationStatus.SENT);
        } catch (FirebaseMessagingException e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());

            if (isInvalidTokenError(e)) {
                deactivateToken(token);
            }
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        } finally {
            pushNotificationRepository.save(notification);
        }
    }

    private boolean isInvalidTokenError(FirebaseMessagingException e) {
        MessagingErrorCode errorCode = e.getMessagingErrorCode();
        return errorCode != null
                && (errorCode.name().equals("UNREGISTERED") || errorCode.name().equals("INVALID_ARGUMENT"));
    }

    private void deactivateToken(String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
        });
    }
}
