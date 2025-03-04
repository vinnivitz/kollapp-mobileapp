package com.none.kollappbackend.organization.application.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role")
public abstract class PersonOfOrganization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="organization_id", nullable = false)
    private Organization organization;

    String surname;

    String name;

    long userId;

    public PersonOfOrganization(String name, String surname, long userId) {
        this.name = name;
        this.surname = surname;
        this.userId = userId;
    }
}