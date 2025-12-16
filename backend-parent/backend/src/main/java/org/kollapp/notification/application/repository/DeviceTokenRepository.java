package org.kollapp.notification.application.repository;

import java.util.List;
import java.util.Optional;

import org.kollapp.notification.application.model.entities.DeviceToken;

/**
 * Repository interface for device token operations.
 */
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
    List<DeviceToken> findActiveByUserId(Long userId);

    /**
     * Find all device tokens for a user.
     *
     * @param userId The user ID
     * @return List of device tokens
     */
    List<DeviceToken> findByUserId(Long userId);

    /**
     * Delete a device token.
     *
     * @param deviceToken The device token to delete
     */
    void delete(DeviceToken deviceToken);
}
