package org.kollapp.notification.adapters.secondary.channel;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Message.Builder;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;

import org.kollapp.notification.application.exception.PushNotificationException;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.model.enums.NotificationStatus;
import org.kollapp.notification.application.model.enums.NotificationType;
import org.kollapp.notification.application.port.PushNotificationChannel;
import org.kollapp.notification.application.repository.DeviceTokenRepository;
import org.kollapp.notification.application.repository.PushNotificationRepository;

/**
 * Firebase Cloud Messaging implementation of push notification channel.
 */
@Slf4j
@Component
@SecondaryAdapter
@AllArgsConstructor
@ConditionalOnBean(FirebaseMessaging.class)
public class FirebaseNotificationChannel implements PushNotificationChannel {

    private final FirebaseMessaging firebaseMessaging;

    private final DeviceTokenRepository deviceTokenRepository;

    private final PushNotificationRepository pushNotificationRepository;

    @Override
    public PushNotification send(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route) {
        PushNotification notification = PushNotification.builder()
                .userId(deviceToken.getUserId())
                .title(title)
                .body(body)
                .notificationType(notificationType)
                .data(route)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            Notification fcmNotification =
                    Notification.builder().setTitle(title).setBody(body).build();

            Builder messageBuilder =
                    Message.builder().setToken(deviceToken.getToken()).setNotification(fcmNotification);

            if (deviceToken.getDeviceType() == DeviceType.ANDROID) {
                messageBuilder.setAndroidConfig(AndroidConfig.builder()
                        .setNotification(AndroidNotification.builder()
                                .setChannelId(notificationType.name())
                                .build())
                        .build());
            }
            if (route != null && !route.isEmpty()) {
                messageBuilder.putData("route", route);
            }

            Message message = messageBuilder.build();
            firebaseMessaging.send(message);

            notification.setStatus(NotificationStatus.SENT);
        } catch (FirebaseMessagingException e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());

            if (isInvalidTokenError(e)) {
                deactivateToken(deviceToken);
            }
        } catch (Exception exception) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(exception.getMessage());
            throw new PushNotificationException();
        }

        return pushNotificationRepository.save(notification);
    }

    @Override
    public boolean supports(DeviceToken deviceToken) {
        // Firebase supports both iOS and Android
        return deviceToken.getDeviceType() != null;
    }

    private boolean isInvalidTokenError(FirebaseMessagingException exception) {
        MessagingErrorCode errorCode = exception.getMessagingErrorCode();
        return errorCode != null
                && (errorCode.name().equals("UNREGISTERED") || errorCode.name().equals("INVALID_ARGUMENT"));
    }

    private void deactivateToken(DeviceToken deviceToken) {
        deviceToken.setActive(false);
        deviceTokenRepository.save(deviceToken);
    }
}
