package org.kollapp.notification.adapters.primary.rest;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;
import org.kollapp.notification.application.exception.DeviceTokenNotFoundException;
import org.kollapp.notification.application.exception.FirebaseMessagingNotConfiguredException;
import org.kollapp.notification.application.exception.NoActiveDeviceTokenFoundException;
import org.kollapp.notification.application.exception.NotificationDataSerializationException;
import org.kollapp.notification.application.exception.PushNotificationException;

@Slf4j
@ControllerAdvice(basePackages = {"org.kollapp.notification"})
public class NotificationExceptionHandler {
    @ExceptionHandler(DeviceTokenNotFoundException.class)
    public ResponseEntity<ErrorResponseTO> handleDeviceTokenNotFoundException(DeviceTokenNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(PushNotificationException.class)
    public ResponseEntity<ErrorResponseTO> handlePushNotificationException(PushNotificationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(NoActiveDeviceTokenFoundException.class)
    public ResponseEntity<ErrorResponseTO> handleNoActiveDeviceTokenFoundException(
            NoActiveDeviceTokenFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(FirebaseMessagingNotConfiguredException.class)
    public ResponseEntity<ErrorResponseTO> handleFirebaseMessagingNotConfiguredException(
            FirebaseMessagingNotConfiguredException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(ex.getMessage()));
    }

    @ExceptionHandler(NotificationDataSerializationException.class)
    public ResponseEntity<ErrorResponseTO> handleNotificationDataSerializationException(
            NotificationDataSerializationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(ex.getMessage()));
    }
}
