package com.none.kollappbackend.organization.application.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "organization", orphanRemoval = true)
    private List<PersonOfOrganization> personsOfOrganization;

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

    public List<OrganizationManager> getManagers() {
        return personsOfOrganization.stream().filter(p -> p instanceof OrganizationManager)
                .map(p -> (OrganizationManager) p).toList();
    }

    public boolean hasManager(OrganizationManager organizationManager) {
        return getManagers().contains(organizationManager);
    }

    public boolean hasOnlyOneManagerLeft() {
        return getManagers().size() == 1;
    }
}
