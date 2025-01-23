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
}
