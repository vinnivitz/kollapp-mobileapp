package org.kollapp.notification.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.ResponseTO;
import org.kollapp.notification.application.exception.DeviceTokenNotFoundException;
import org.kollapp.notification.application.exception.FirebaseMessagingNotConfiguredException;
import org.kollapp.notification.application.exception.NoActiveDeviceTokenFoundException;
import org.kollapp.notification.application.exception.NotificationDataSerializationException;
import org.kollapp.notification.application.exception.PushNotificationException;

@ControllerAdvice(basePackages = {"org.kollapp.notification"})
@RestController
@AllArgsConstructor
public class NotificationExceptionHandler {

    private final MessageUtil messageUtil;

    @ExceptionHandler(DeviceTokenNotFoundException.class)
    public ResponseEntity<ResponseTO> handleDeviceTokenNotFound() {
        String message = messageUtil.getMessage("error.device-token.not-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(PushNotificationException.class)
    public ResponseEntity<ResponseTO> handlePushNotification() {
        String message = messageUtil.getMessage("error.notification.failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NoActiveDeviceTokenFoundException.class)
    public ResponseEntity<ResponseTO> handleNoActiveDeviceTokenFound() {
        String message = messageUtil.getMessage("error.device-token.no-active-token-found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(FirebaseMessagingNotConfiguredException.class)
    public ResponseEntity<ResponseTO> handleFirebaseMessagingNotConfigured() {
        String message = messageUtil.getMessage("error.firebase-messaging.not-configured");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NotificationDataSerializationException.class)
    public ResponseEntity<ResponseTO> handleNotificationDataSerialization() {
        String message = messageUtil.getMessage("error.notification.data.serialization-failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }
}
