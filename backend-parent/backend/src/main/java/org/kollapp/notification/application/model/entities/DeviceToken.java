package org.kollapp.notification.application.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.application.model.enums.DeviceType;

/**
 * Entity representing a device token for push notifications.
 */
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private long userId;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType deviceType;

    @Column(nullable = false, length = 128)
    private String deviceName;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
