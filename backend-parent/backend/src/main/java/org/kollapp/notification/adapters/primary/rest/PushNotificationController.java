package org.kollapp.notification.adapters.primary.rest;

import java.util.List;

import jakarta.validation.Valid;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.notification.adapters.primary.rest.dto.DeviceTokenRegistrationRequestTO;
import org.kollapp.notification.adapters.primary.rest.dto.DeviceTokenTO;
import org.kollapp.notification.adapters.primary.rest.dto.PushNotificationTO;
import org.kollapp.notification.adapters.primary.rest.dto.TestNotificationRequestTO;
import org.kollapp.notification.adapters.primary.rest.mapper.DeviceTokenMapper;
import org.kollapp.notification.adapters.primary.rest.mapper.PushNotificationMapper;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.service.PushNotificationService;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.service.KollappUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * REST controller for push notification operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@PrimaryAdapter
@AllArgsConstructor
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    private final KollappUserService kollappUserService;

    private final DeviceTokenMapper deviceTokenMapper;

    private final PushNotificationMapper pushNotificationMapper;

    private final MessageUtil messageUtil;

    @PostMapping("/device-token")
    @Operation(
            summary = "Register a device token for push notifications",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<DeviceTokenTO>> registerDeviceToken(
            @Valid @RequestBody DeviceTokenRegistrationRequestTO request) {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();

        DeviceType deviceType = DeviceType.valueOf(request.getDeviceType().name());

        DeviceToken deviceToken = pushNotificationService.registerDeviceToken(
                kollappUser.getId(), request.getToken(), deviceType, request.getDeviceName());

        DeviceTokenTO response = deviceTokenMapper.toTO(deviceToken);
        String message = messageUtil.getMessage("success.notification.device-token-registered");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @DeleteMapping("/device-token")
    @Operation(
            summary = "Unregister a device token",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> unregisterDeviceToken(@RequestParam("token") String token) {
        pushNotificationService.unregisterDeviceToken(token);
        String message = messageUtil.getMessage("success.notification.device-token-unregistered");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }

    @GetMapping("/device-tokens")
    @Operation(
            summary = "Get all active device tokens for the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<List<DeviceTokenTO>>> getUserDeviceTokens() {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        List<DeviceToken> deviceTokens = pushNotificationService.getUserDeviceTokens(kollappUser.getId());
        List<DeviceTokenTO> response = deviceTokenMapper.toTOs(deviceTokens);
        String message = messageUtil.getMessage("success.notification.device-tokens-retrieved");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @GetMapping
    @Operation(
            summary = "Get notifications for the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<List<PushNotificationTO>>> getUserNotifications(
            @RequestParam(value = "limit", required = false) Integer limit) {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        List<PushNotification> notifications = pushNotificationService.getUserNotifications(kollappUser.getId(), limit);
        List<PushNotificationTO> response = pushNotificationMapper.toTOs(notifications);
        String message = messageUtil.getMessage("success.notification.notifications-retrieved");
        return ResponseEntity.ok(new DataResponseTO<>(response, message));
    }

    @PostMapping("/test")
    @Operation(
            summary = "Send a test push notification to all registered devices of the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> sendTestNotification(
            @Valid @RequestBody TestNotificationRequestTO request) {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        pushNotificationService.sendNotificationToUser(
                kollappUser.getId(),
                request.getTitle(),
                request.getBody(),
                request.getNotificationType(),
                request.getRoute());
        String message = messageUtil.getMessage("success.notification.test-notification-sent");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }
}
