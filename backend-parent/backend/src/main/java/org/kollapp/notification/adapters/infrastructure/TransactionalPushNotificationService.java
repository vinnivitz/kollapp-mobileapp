package org.kollapp.notification.adapters.infrastructure;

import java.util.List;

import jakarta.transaction.Transactional;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import org.kollapp.notification.application.port.primary.PushNotificationService;
import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.entities.PushNotification;
import org.kollapp.notification.domain.enums.DeviceType;
import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Transactional decorator for PushNotificationService.
 * This is an infrastructure concern that adds transactional behavior.
 */
@PrimaryAdapter
@Transactional
@Component
@Primary
public class TransactionalPushNotificationService implements PushNotificationService {

    private final PushNotificationService delegate;

    public TransactionalPushNotificationService(PushNotificationService delegate) {
        this.delegate = delegate;
    }

    @Override
    public DeviceToken registerDeviceToken(long userId, String token, DeviceType deviceType, String deviceName) {
        return delegate.registerDeviceToken(userId, token, deviceType, deviceName);
    }

    @Override
    public void unregisterDeviceToken(String token) {
        delegate.unregisterDeviceToken(token);
    }

    @Override
    public List<DeviceToken> getUserDeviceTokens(long userId) {
        return delegate.getUserDeviceTokens(userId);
    }

    @Override
    public void sendNotificationToUser(
            long userId, String title, String body, NotificationType notificationType, String route) {
        delegate.sendNotificationToUser(userId, title, body, notificationType, route);
    }

    @Override
    public void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route) {
        delegate.sendNotificationToUsers(userIds, title, body, notificationType, route);
    }

    @Override
    public List<PushNotification> getUserNotifications(long userId, Integer limit) {
        return delegate.getUserNotifications(userId, limit);
    }

    @Override
    public void deleteNotification(long userId, long notificationId) {
        delegate.deleteNotification(userId, notificationId);
    }

    @Override
    public void deleteAllUserNotifications(long userId) {
        delegate.deleteAllUserNotifications(userId);
    }
}
