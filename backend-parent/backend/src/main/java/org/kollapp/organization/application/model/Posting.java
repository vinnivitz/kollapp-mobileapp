package org.kollapp.organization.application.model;

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

    @Column(length = 10_000_000, nullable = false)
    private long amountInCents;

    @Column(length = 10, nullable = false)
    private String date;

    @Column(length = 50, nullable = false)
    private String purpose;

    public Posting(PostingType type, long amountInCents, String date, String purpose) {
        this.type = type;
        this.amountInCents = amountInCents;
        this.date = date;
        this.purpose = purpose;
    }
}
