package org.kollapp.notification.adapters.secondary.db;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.stereotype.Repository;

import org.kollapp.notification.adapters.secondary.db.jpa.DeviceTokenJpaRepository;
import org.kollapp.notification.adapters.secondary.db.jpa.NotificationJpaMapper;
import org.kollapp.notification.application.port.secondary.DeviceTokenRepository;
import org.kollapp.notification.domain.entities.DeviceToken;

/**
 * Implementation of DeviceTokenRepository using JPA.
 */
@Repository
@SecondaryAdapter
@RequiredArgsConstructor
public class DeviceTokenRepositoryImpl implements DeviceTokenRepository {
    private final DeviceTokenJpaRepository jpaRepository;

    @Override
    public DeviceToken save(DeviceToken deviceToken) {
        return NotificationJpaMapper.toDomain(jpaRepository.save(NotificationJpaMapper.toEntity(deviceToken)));
    }

    @Override
    public Optional<DeviceToken> findByToken(String token) {
        return jpaRepository.findByToken(token).map(NotificationJpaMapper::toDomain);
    }

    @Override
    public List<DeviceToken> findActiveByUserId(long userId) {
        return jpaRepository.findByUserIdAndActive(userId, true).stream()
                .map(NotificationJpaMapper::toDomain)
                .collect(Collectors.toList());
    }
}
