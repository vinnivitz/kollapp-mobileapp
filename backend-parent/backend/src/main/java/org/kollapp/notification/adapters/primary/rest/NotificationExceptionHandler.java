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
import org.kollapp.notification.application.exception.InvalidDeviceTypeException;
import org.kollapp.notification.application.exception.NoNotificationChannelAvailableException;
import org.kollapp.notification.application.exception.NoNotificationChannelsConfiguredException;
import org.kollapp.notification.application.exception.PushNotificationException;

@ControllerAdvice(basePackages = {"org.kollapp.notification"})
@RestController
@AllArgsConstructor
public class NotificationExceptionHandler {

    private final MessageUtil messageUtil;

    @ExceptionHandler(PushNotificationException.class)
    public ResponseEntity<ResponseTO> handlePushNotification() {
        String message = messageUtil.getMessage("error.notification.failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(InvalidDeviceTypeException.class)
    public ResponseEntity<ResponseTO> handleInvalidDeviceType() {
        String message = messageUtil.getMessage("error.device-type.invalid");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NoNotificationChannelsConfiguredException.class)
    public ResponseEntity<ResponseTO> handleNoNotificationChannelsConfigured() {
        String message = messageUtil.getMessage("error.notification.no-channels-configured");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }

    @ExceptionHandler(NoNotificationChannelAvailableException.class)
    public ResponseEntity<ResponseTO> handleNoNotificationChannelAvailable() {
        String message = messageUtil.getMessage("error.notification.no-channel-available");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseTO(message));
    }
}
