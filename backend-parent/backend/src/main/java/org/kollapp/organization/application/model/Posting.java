package org.kollapp.organization.application.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "scope")
public abstract class Posting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostingType type;

    @Column(nullable = false)
    private long amountInCents;

    @Column(length = 10, nullable = false)
    private String date;

    @Column(length = 50, nullable = false)
    private String purpose;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * The person who is referenced to this posting. If 0, the collective is
     * assigned.
     */
    private long personOfOrganizationId;

    public Posting(PostingType type, long amountInCents, String date, String purpose, long personOfOrganizationId) {
        this.type = type;
        this.amountInCents = amountInCents;
        this.date = date;
        this.purpose = purpose;
        this.personOfOrganizationId = personOfOrganizationId;
    }

    public void transfer() {
        this.setPersonOfOrganizationId(0);
    }

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
