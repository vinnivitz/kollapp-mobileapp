package org.kollapp.notification.adapters.secondary.db.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.notification.application.model.entities.DeviceToken;

/**
 * JPA repository for device tokens.
 */
public interface DeviceTokenJpaRepository extends JpaRepository<DeviceToken, Long> {
    /**
     * Find a device token by token.
     *
     * @param token The token
     * @return Optional containing the device token if found
     */
    Optional<DeviceToken> findByToken(String token);

    /**
     * Find all active device tokens for a user.
     *
     * @param userId The user ID
     * @param active The active status
     * @return List of active device tokens
     */
    List<DeviceToken> findByUserIdAndActive(long userId, boolean active);
}
