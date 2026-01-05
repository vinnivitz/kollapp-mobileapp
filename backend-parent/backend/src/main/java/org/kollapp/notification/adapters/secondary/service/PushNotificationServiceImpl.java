package org.kollapp.notification.adapters.secondary.service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.kollapp.notification.application.exception.NoNotificationChannelAvailableException;
import org.kollapp.notification.application.exception.NoNotificationChannelsConfiguredException;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.port.PushNotificationChannel;
import org.kollapp.notification.application.repository.DeviceTokenRepository;
import org.kollapp.notification.application.repository.PushNotificationRepository;
import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Implementation of push notification service with support for multiple
 * notification channels.
 */
@Slf4j
@SecondaryAdapter
@Service
@AllArgsConstructor
public class PushNotificationServiceImpl implements PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepository;

    private final PushNotificationRepository pushNotificationRepository;

    private final List<PushNotificationChannel> notificationChannels;

    @Override
    @Transactional
    public DeviceToken registerDeviceToken(long userId, String token, DeviceType deviceType, String deviceName) {
        Optional<DeviceToken> existingTokenOpt = deviceTokenRepository.findByToken(token);
        if (existingTokenOpt.isPresent()) {
            DeviceToken existingToken = existingTokenOpt.get();

            existingToken.setUserId(userId);
            existingToken.setDeviceType(deviceType);
            existingToken.setDeviceName(deviceName);
            existingToken.setActive(true);

            DeviceToken savedToken = deviceTokenRepository.save(existingToken);
            return savedToken;
        }

        DeviceToken deviceToken = DeviceToken.builder()
                .token(token)
                .deviceType(deviceType)
                .userId(userId)
                .deviceName(deviceName)
                .active(true)
                .build();

        return deviceTokenRepository.save(deviceToken);
    }

    @Override
    @Transactional
    public void unregisterDeviceToken(String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> getUserDeviceTokens(long userId) {
        return deviceTokenRepository.findActiveByUserId(userId);
    }

    @Override
    public void sendNotificationToUser(
            long userId, String title, String body, NotificationType notificationType, String route) {
        List<DeviceToken> deviceTokens = deviceTokenRepository.findActiveByUserId(userId);

        if (deviceTokens.isEmpty()) {
            return;
        }

        deviceTokens.forEach(deviceToken -> sendNotificationAsync(deviceToken, title, body, notificationType, route));
    }

    @Override
    public void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {

        userIds.forEach(userId -> {
            sendNotificationToUser(userId, title, body, notificationType, route);
        });
    }

    @Async
    private CompletableFuture<PushNotification> sendNotificationAsync(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route) {
        PushNotificationChannel channel = selectChannel(deviceToken);
        PushNotification notification = channel.send(deviceToken, title, body, notificationType, route);
        return CompletableFuture.completedFuture(notification);
    }

    private PushNotificationChannel selectChannel(DeviceToken deviceToken) {
        if (notificationChannels == null || notificationChannels.isEmpty()) {
            throw new NoNotificationChannelsConfiguredException();
        }

        return notificationChannels.stream()
                .filter(channel -> channel.supports(deviceToken))
                .findFirst()
                .orElseThrow(() -> new NoNotificationChannelAvailableException());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PushNotification> getUserNotifications(long userId, Integer limit) {
        return pushNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId, limit);
    }

    @Override
    @Transactional
    public void deleteNotification(long userId, long notificationId) {
        pushNotificationRepository.deleteByIdAndUserId(notificationId, userId);
    }

    @Override
    @Transactional
    public void deleteAllUserNotifications(long userId) {
        pushNotificationRepository.deleteAllByUserId(userId);
    }
}
