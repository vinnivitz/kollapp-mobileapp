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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.notification.application.model.enums.NotificationStatus;
import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Entity representing a push notification record.
 */
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PushNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private long userId;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 2048)
    private String body;

    @Column(columnDefinition = "TEXT")
    private String data;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
