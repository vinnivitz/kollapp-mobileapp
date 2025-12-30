package org.kollapp.organization.application.model;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;

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

    public OrganizationPosting getOrganizationPostingById(long postingId) {
        return getOrganizationPostings().stream()
            .filter(p -> p.getId() == postingId)
            .findFirst()
            .orElseThrow(PostingDoesNotExistException::new);
    }

    public List<Long> getPersonOfOrganizationIds() {
        return getPersonsOfOrganization()
            .stream()
            .map(PersonOfOrganization::getId)
            .toList();
    }

    public PersonOfOrganization getPersonOfOrganizationByUserId(long userId) {
        return getPersonsOfOrganization()
            .stream()
            .filter(p -> p.getUserId() == userId)
            .findFirst().orElseThrow(PersonNotRegisteredInOrganizationException::new);
    }

    public Activity getActivityById(long activityId) {
        return getActivities().stream()
            .filter(a -> a.getId() == activityId)
            .findFirst()
            .orElseThrow(ActivityNotFoundException::new);
    }

    public List<Posting> getAllOrganizationAndActivityPostings() {
        List<Posting> postings = new ArrayList<>(organizationPostings);
        List<Posting> activityPostings = activities.stream()
            .map(Activity::getActivityPostings)
            .toList()
            .stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
        postings.addAll(activityPostings);
        return postings;
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
}
