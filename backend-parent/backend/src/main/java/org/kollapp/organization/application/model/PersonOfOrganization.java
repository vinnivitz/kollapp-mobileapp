package org.kollapp.organization.application.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
public class PersonOfOrganization {
    private long userId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    private OrganizationRole organizationRole;

    @Enumerated(EnumType.STRING)
    private PersonOfOrganizationStatus status;

    public boolean isManager() {
        return organizationRole.equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER);
    }

    public boolean isMember() {
        return organizationRole.equals(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
    }
}
