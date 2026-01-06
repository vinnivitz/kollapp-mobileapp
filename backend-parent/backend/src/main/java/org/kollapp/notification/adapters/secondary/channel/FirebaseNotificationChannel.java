package org.kollapp.notification.adapters.secondary.channel;

import lombok.RequiredArgsConstructor;
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
import org.kollapp.notification.application.port.secondary.PushNotificationChannel;
import org.kollapp.notification.application.port.secondary.PushNotificationSendResult;
import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.enums.DeviceType;
import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Firebase Cloud Messaging implementation of push notification channel.
 */
@Slf4j
@Component
@SecondaryAdapter
@RequiredArgsConstructor
@ConditionalOnBean(FirebaseMessaging.class)
public class FirebaseNotificationChannel implements PushNotificationChannel {

    private final FirebaseMessaging firebaseMessaging;

    @Override
    public PushNotificationSendResult send(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route) {
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

            return PushNotificationSendResult.sent();
        } catch (FirebaseMessagingException e) {
            return PushNotificationSendResult.failed(e.getMessage(), isInvalidTokenError(e));
        } catch (Exception exception) {
            log.error("Unexpected error while sending push notification", exception);
            throw new PushNotificationException();
        }
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
}
