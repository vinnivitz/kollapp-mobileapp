package org.kollappbackend.organization.application.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

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

    private String name;

    private String description;

    private String place;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<PersonOfOrganization> personsOfOrganization;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "organization", orphanRemoval = true)
    private OrganizationInvitationCode organizationInvitationCode;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<Activity> activities;

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

    public List<PersonOfOrganization> getManagers() {
        return personsOfOrganization.stream()
                .filter(p ->
                        p.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MANAGING_MEMBER))
                .toList();
    }

    public boolean hasOnlyOneManagerLeft() {
        return getManagers().size() == 1;
    }

    public OrganizationInvitationCode generateNewInvitationCode(int validityDays) {
        String code = generateInvitationCode();
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
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    public void exchangePersonOfOrganization(PersonOfOrganization original, PersonOfOrganization updated) {
        updated.setOrganization(this);
        personsOfOrganization.remove(original);
        personsOfOrganization.add(updated);
    }

    public void initChildren() {
        Hibernate.initialize(personsOfOrganization);
        Hibernate.initialize(activities);
    }
}
