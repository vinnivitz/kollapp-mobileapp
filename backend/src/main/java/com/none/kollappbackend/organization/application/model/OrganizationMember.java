package com.none.kollappbackend.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("member")
@NoArgsConstructor
public class OrganizationMember extends PersonOfOrganization {
    public OrganizationMember(String name, String surname, long userId) {
        super(name, surname, userId);
    }
}
