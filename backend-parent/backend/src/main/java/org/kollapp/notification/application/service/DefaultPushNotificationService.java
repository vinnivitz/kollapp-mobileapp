package org.kollapp.notification.application.service;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

import org.kollapp.notification.application.exception.NoNotificationChannelAvailableException;
import org.kollapp.notification.application.exception.NoNotificationChannelsConfiguredException;
import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.application.port.secondary.DeviceTokenRepository;
import org.kollapp.notification.application.port.secondary.PushNotificationChannel;
import org.kollapp.notification.application.port.secondary.PushNotificationRepository;
import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.entities.PushNotification;
import org.kollapp.notification.domain.enums.DeviceType;
import org.kollapp.notification.domain.enums.NotificationStatus;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.notification.domain.model.PushNotificationSendResult;

@RequiredArgsConstructor
public class DefaultPushNotificationService implements PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepository;

    private final PushNotificationRepository pushNotificationRepository;

    private final List<PushNotificationChannel> notificationChannels;

    @Override
    public DeviceToken registerDeviceToken(long userId, String token, DeviceType deviceType, String deviceName) {
        Optional<DeviceToken> existingTokenOpt = deviceTokenRepository.findByToken(token);
        if (existingTokenOpt.isPresent()) {
            DeviceToken existingToken = existingTokenOpt.get();

            existingToken.setUserId(userId);
            existingToken.setDeviceType(deviceType);
            existingToken.setDeviceName(deviceName);
            existingToken.setActive(true);

            return deviceTokenRepository.save(existingToken);
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
    public void unregisterDeviceToken(String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
        });
    }

    @Override
    public List<DeviceToken> getUserDeviceTokens(long userId) {
        return deviceTokenRepository.findActiveByUserId(userId);
    }

    @Override
    public void sendNotificationToUser(
            long userId, String title, String body, NotificationType notificationType, String route) {
        List<DeviceToken> deviceTokens = getUserDeviceTokens(userId);
        for (DeviceToken deviceToken : deviceTokens) {
            sendNotificationToDeviceToken(deviceToken, title, body, notificationType, route);
        }
    }

    @Override
    public void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {
        for (Long userId : userIds) {
            sendNotificationToUser(userId, title, body, notificationType, route);
        }
    }

    @Override
    public List<PushNotification> getUserNotifications(long userId, Integer limit) {
        return pushNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId, limit);
    }

    @Override
    public void deleteNotification(long userId, long notificationId) {
        pushNotificationRepository.deleteByIdAndUserId(notificationId, userId);
    }

    @Override
    public void deleteAllUserNotifications(long userId) {
        pushNotificationRepository.deleteAllByUserId(userId);
    }

    private PushNotification sendNotificationToDeviceToken(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route) {
        PushNotificationChannel channel = selectChannel(deviceToken);

        PushNotification notification = PushNotification.builder()
                .userId(deviceToken.getUserId())
                .title(title)
                .body(body)
                .notificationType(notificationType)
                .data(route)
                .status(NotificationStatus.PENDING)
                .build();

        PushNotificationSendResult result = channel.send(deviceToken, title, body, notificationType, route);
        notification.setStatus(result.getStatus());
        notification.setErrorMessage(result.getErrorMessage());

        if (result.isInvalidToken()) {
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
        }

        return pushNotificationRepository.save(notification);
    }

    private PushNotificationChannel selectChannel(DeviceToken deviceToken) {
        if (notificationChannels == null || notificationChannels.isEmpty()) {
            throw new NoNotificationChannelsConfiguredException();
        }

        return notificationChannels.stream()
                .filter(channel -> channel.supports(deviceToken))
                .findFirst()
                .orElseThrow(NoNotificationChannelAvailableException::new);
    }
}
