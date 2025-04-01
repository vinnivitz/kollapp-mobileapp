package org.kollappbackend.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("manager")
@NoArgsConstructor
public class OrganizationManager extends PersonOfOrganization {
    public OrganizationManager(String name, String surname, long userId) {
        super(name, surname, userId);
    }
}
