package org.kollapp.notification.adapters.infrastructure;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.transaction.annotation.Transactional;

import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.entities.PushNotification;
import org.kollapp.notification.domain.enums.DeviceType;
import org.kollapp.notification.domain.enums.NotificationType;

@RequiredArgsConstructor
public class TransactionalPushNotificationService implements PushNotificationService {

    private final PushNotificationService delegate;

    @Override
    @Transactional
    public DeviceToken registerDeviceToken(long userId, String token, DeviceType deviceType, String deviceName) {
        return delegate.registerDeviceToken(userId, token, deviceType, deviceName);
    }

    @Override
    @Transactional
    public void unregisterDeviceToken(String token) {
        delegate.unregisterDeviceToken(token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> getUserDeviceTokens(long userId) {
        return delegate.getUserDeviceTokens(userId);
    }

    @Override
    @Transactional
    public void sendNotificationToUser(
            long userId, String title, String body, NotificationType notificationType, String route) {
        delegate.sendNotificationToUser(userId, title, body, notificationType, route);
    }

    @Override
    @Transactional
    public void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {
        delegate.sendNotificationToUsers(userIds, title, body, notificationType, route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PushNotification> getUserNotifications(long userId, Integer limit) {
        return delegate.getUserNotifications(userId, limit);
    }

    @Override
    @Transactional
    public void deleteNotification(long userId, long notificationId) {
        delegate.deleteNotification(userId, notificationId);
    }

    @Override
    @Transactional
    public void deleteAllUserNotifications(long userId) {
        delegate.deleteAllUserNotifications(userId);
    }
}
