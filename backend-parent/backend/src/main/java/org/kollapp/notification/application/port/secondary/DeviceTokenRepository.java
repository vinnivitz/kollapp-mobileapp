package org.kollapp.notification.application.port.secondary;

import java.util.List;
import java.util.Optional;

import org.jmolecules.architecture.hexagonal.SecondaryPort;

import org.kollapp.notification.domain.entities.DeviceToken;

/**
 * Repository interface for device token operations.
 */
@SecondaryPort
public interface DeviceTokenRepository {
    /**
     * Save a device token.
     *
     * @param deviceToken The device token to save
     * @return The saved device token
     */
    DeviceToken save(DeviceToken deviceToken);

    /**
     * Find a device token by token string.
     *
     * @param token The token string
     * @return Optional containing the device token if found
     */
    Optional<DeviceToken> findByToken(String token);

    /**
     * Find all active device tokens for a user.
     *
     * @param userId The user ID
     * @return List of active device tokens
     */
    List<DeviceToken> findActiveByUserId(long userId);
}
