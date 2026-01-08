package org.kollapp.organization.application.model;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.Hibernate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 50, nullable = false)
    private String place;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<PersonOfOrganization> personsOfOrganization;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "organization", orphanRemoval = true)
    private OrganizationInvitationCode organizationInvitationCode;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<Activity> activities;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<OrganizationPosting> organizationPostings;

    public void addPersonOfOrganization(PersonOfOrganization personOfOrganization) {
        if (personsOfOrganization != null) {
            personsOfOrganization.add(personOfOrganization);
            return;
        }
        personsOfOrganization = new ArrayList<>();
        personsOfOrganization.add(personOfOrganization);
    }

    public void addActivityOfOrganization(Activity activity) {
        if (activities == null) {
            activities = new ArrayList<>();
        }
        activities.add(activity);
    }

    public List<PersonOfOrganization> fetchManagers() {
        return personsOfOrganization.stream()
                .filter(p -> p.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER))
                .toList();
    }

    public boolean hasOnlyOneManagerLeft() {
        return fetchManagers().size() == 1;
    }

    public OrganizationInvitationCode generateNewInvitationCode(int validityDays) {
        String code = generateInvitationCode().toUpperCase();
        String expirationDate = LocalDate.now().plusDays(validityDays).toString();
        if (getOrganizationInvitationCode() == null) {
            organizationInvitationCode = OrganizationInvitationCode.builder()
                    .code(code)
                    .expirationDate(expirationDate)
                    .organization(this)
                    .build();
        } else {
            organizationInvitationCode.setCode(code);
            organizationInvitationCode.setExpirationDate(expirationDate);
        }
        return organizationInvitationCode;
    }

    private String generateInvitationCode() {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 8;
        SecureRandom random = new SecureRandom();

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    public void initChildren() {
        Hibernate.initialize(personsOfOrganization);
        Hibernate.initialize(activities);
        Hibernate.initialize(organizationPostings);
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
