package org.kollapp.notification.adapters.secondary.db;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Repository;

import org.kollapp.notification.adapters.secondary.db.jpa.PushNotificationJpaRepository;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.repository.PushNotificationRepository;

/**
 * Implementation of PushNotificationRepository using JPA.
 */
@Repository
@RequiredArgsConstructor
public class PushNotificationRepositoryImpl implements PushNotificationRepository {
    private final PushNotificationJpaRepository jpaRepository;

    @Override
    public PushNotification save(PushNotification notification) {
        return jpaRepository.save(notification);
    }
}
