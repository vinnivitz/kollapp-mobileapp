package com.none.kollappbackend.organization.application.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

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

    public void addPersonOfOrganization(PersonOfOrganization personOfOrganization) {
        personsOfOrganization.add(personOfOrganization);
    }

    public List<OrganizationManager> getManagers(){
        return personsOfOrganization.stream()
                .filter(p -> p instanceof OrganizationManager)
                .map(p -> (OrganizationManager) p)
                .toList();
    }

    public boolean hasManager(OrganizationManager organizationManager) {
        return getManagers().contains(organizationManager);
    }

    public boolean hasOnlyOneManagerLeft(){
        return personsOfOrganization.size() == 1;
    }
}
