package org.kollapp.notification.adapters.primary.rest;

import java.util.List;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.notification.adapters.primary.rest.dto.DeviceTokenRegistrationRequestTO;
import org.kollapp.notification.adapters.primary.rest.dto.DeviceTokenTO;
import org.kollapp.notification.adapters.primary.rest.dto.SendNotificationRequestTO;
import org.kollapp.notification.adapters.primary.rest.dto.SendNotificationToUsersRequestTO;
import org.kollapp.notification.adapters.primary.rest.mapper.DeviceTokenMapper;
import org.kollapp.notification.application.model.entities.DeviceToken;
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
public class PushNotificationController {
    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private DeviceTokenMapper deviceTokenMapper;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/device-token")
    @Operation(
            summary = "Register a device token for push notifications",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<DeviceTokenTO>> registerDeviceToken(
            @Valid @RequestBody DeviceTokenRegistrationRequestTO request) {
        KollappUser user = kollappUserService.getLoggedInKollappUser();

        DeviceType deviceType = DeviceType.valueOf(request.getDeviceType().name());

        DeviceToken deviceToken =
                pushNotificationService.registerDeviceToken(user.getId(), request.getToken(), deviceType);

        DeviceTokenTO response = deviceTokenMapper.toTO(deviceToken);
        return ResponseEntity.ok(
                new DataResponseTO<>(response, "success.notification.device-token-registered", messageSource));
    }

    @DeleteMapping("/device-token")
    @Operation(
            summary = "Unregister a device token",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> unregisterDeviceToken(@RequestParam("token") String token) {
        pushNotificationService.unregisterDeviceToken(token);
        return ResponseEntity.ok(
                new MessageResponseTO("success.notification.device-token-unregistered", messageSource));
    }

    @GetMapping("/device-tokens")
    @Operation(
            summary = "Get all active device tokens for the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<List<DeviceTokenTO>>> getUserDeviceTokens() {
        var user = kollappUserService.getLoggedInKollappUser();
        var deviceTokens = pushNotificationService.getUserDeviceTokens(user.getId());
        var response = deviceTokenMapper.toTOs(deviceTokens);
        return ResponseEntity.ok(
                new DataResponseTO<>(response, "success.notification.device-tokens-retrieved", messageSource));
    }

    @PostMapping("/send")
    @Operation(
            summary = "Send a push notification to the logged in user (for testing)",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> sendNotificationToSelf(
            @Valid @RequestBody SendNotificationRequestTO request) {
        var user = kollappUserService.getLoggedInKollappUser();
        pushNotificationService.sendNotificationToUser(
                user.getId(), request.getTitle(), request.getBody(), request.getData());
        return ResponseEntity.ok(new MessageResponseTO("success.notification.sent", messageSource));
    }

    @PostMapping("/send-to-users")
    @Operation(
            summary = "Send a push notification to multiple users (admin only)",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> sendNotificationToUsers(
            @Valid @RequestBody SendNotificationToUsersRequestTO request) {
        pushNotificationService.sendNotificationToUsers(
                request.getUserIds(), request.getTitle(), request.getBody(), request.getData());
        return ResponseEntity.ok(new MessageResponseTO("success.notification.sent", messageSource));
    }
}
