package org.kollapp.notification.adapters.secondary.db.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.notification.adapters.secondary.db.jpa.entities.DeviceTokenEntity;

/**
 * JPA repository for device tokens.
 */
public interface DeviceTokenJpaRepository extends JpaRepository<DeviceTokenEntity, Long> {
    /**
     * Find a device token by token.
     *
     * @param token The token
     * @return Optional containing the device token if found
     */
    Optional<DeviceTokenEntity> findByToken(String token);

    /**
     * Find all active device tokens for a user.
     *
     * @param userId The user ID
     * @param active The active status
     * @return List of active device tokens
     */
    List<DeviceTokenEntity> findByUserIdAndActive(long userId, boolean active);
}
