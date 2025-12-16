package org.kollapp.notification.adapters.secondary.db;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Repository;

import org.kollapp.notification.adapters.secondary.db.jpa.DeviceTokenJpaRepository;
import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.repository.DeviceTokenRepository;

/**
 * Implementation of DeviceTokenRepository using JPA.
 */
@Repository
@RequiredArgsConstructor
public class DeviceTokenRepositoryImpl implements DeviceTokenRepository {
    private final DeviceTokenJpaRepository jpaRepository;

    @Override
    public DeviceToken save(DeviceToken deviceToken) {
        return jpaRepository.save(deviceToken);
    }

    @Override
    public Optional<DeviceToken> findByToken(String token) {
        return jpaRepository.findByToken(token);
    }

    @Override
    public List<DeviceToken> findActiveByUserId(Long userId) {
        return jpaRepository.findByUserIdAndActive(userId, true);
    }

    @Override
    public List<DeviceToken> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId);
    }

    @Override
    public void delete(DeviceToken deviceToken) {
        jpaRepository.delete(deviceToken);
    }
}
