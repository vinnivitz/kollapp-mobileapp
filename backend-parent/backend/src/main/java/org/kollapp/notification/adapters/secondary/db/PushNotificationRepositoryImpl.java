package org.kollapp.notification.adapters.secondary.db;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import org.kollapp.notification.adapters.secondary.db.jpa.NotificationJpaMapper;
import org.kollapp.notification.adapters.secondary.db.jpa.PushNotificationJpaRepository;
import org.kollapp.notification.application.port.secondary.PushNotificationRepository;
import org.kollapp.notification.domain.entities.PushNotification;

/**
 * Implementation of PushNotificationRepository using JPA.
 */
@Repository
@SecondaryAdapter
@RequiredArgsConstructor
public class PushNotificationRepositoryImpl implements PushNotificationRepository {
    private final PushNotificationJpaRepository jpaRepository;

    @Override
    public PushNotification save(PushNotification notification) {
        return NotificationJpaMapper.toDomain(jpaRepository.save(NotificationJpaMapper.toEntity(notification)));
    }

    @Override
    public List<PushNotification> findByUserIdOrderByCreatedAtDesc(long userId, Integer limit) {
        if (limit == null) {
            return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                    .map(NotificationJpaMapper::toDomain)
                    .collect(Collectors.toList());
        }
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit)).stream()
                .map(NotificationJpaMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByIdAndUserId(long notificationId, long userId) {
        jpaRepository.deleteByIdAndUserId(notificationId, userId);
    }

    @Override
    public void deleteAllByUserId(long userId) {
        jpaRepository.deleteAllByUserId(userId);
    }
}
