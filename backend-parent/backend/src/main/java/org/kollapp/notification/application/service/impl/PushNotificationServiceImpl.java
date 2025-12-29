package org.kollapp.notification.application.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.kollapp.notification.application.exception.DeviceTokenNotFoundException;
import org.kollapp.notification.application.exception.NoActiveDeviceTokenFoundException;
import org.kollapp.notification.application.exception.PushNotificationException;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.port.PushNotificationChannel;
import org.kollapp.notification.application.repository.DeviceTokenRepository;
import org.kollapp.notification.application.repository.PushNotificationRepository;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Implementation of PushNotificationService with support for multiple notification channels.
 */
@Slf4j
@Service
@Transactional
public class PushNotificationServiceImpl implements PushNotificationService {
    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private PushNotificationRepository pushNotificationRepository;

    @Autowired
    private List<PushNotificationChannel> notificationChannels;

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
            CompletableFuture.runAsync(() -> sendNotificationAsync(deviceToken, title, body, data));
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

        sendNotificationAsync(deviceToken, title, body, data);
    }

    private void sendNotificationAsync(DeviceToken deviceToken, String title, String body, Map<String, String> data) {
        PushNotificationChannel channel = selectChannel(deviceToken);

        if (channel == null) {
            log.warn("No notification channel available for device type: {}", deviceToken.getDeviceType());
            PushNotification notification = PushNotification.builder()
                    .userId(deviceToken.getUserId())
                    .title(title)
                    .body(body)
                    .build();
            throw new PushNotificationException();
        }

        try {
            PushNotification notification = channel.send(deviceToken, title, body, data);
            pushNotificationRepository.save(notification);
            log.debug(
                    "Notification sent via channel '{}' with status: {}",
                    channel.getChannelName(),
                    notification.getStatus());
        } catch (Exception e) {
            log.error("Failed to send notification via channel '{}': {}", channel.getChannelName(), e.getMessage());
            throw e;
        }
    }

    private PushNotificationChannel selectChannel(DeviceToken deviceToken) {
        return notificationChannels.stream()
                .filter(channel -> channel.supports(deviceToken))
                .findFirst()
                .orElse(null);
    }
}
