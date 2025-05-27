package org.kollappbackend.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("member")
@NoArgsConstructor
public class OrganizationMember extends PersonOfOrganization {
    public OrganizationMember(long userId, String username, PersonOfOrganizationStatus status) {
        super(userId, username, status);
    }
}
