package org.kollapp.notification.adapters.secondary.db.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.notification.application.model.entities.PushNotification;

/**
 * JPA repository for push notifications.
 */
public interface PushNotificationJpaRepository extends JpaRepository<PushNotification, Long> {}
