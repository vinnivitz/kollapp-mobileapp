package org.kollappbackend.organization.adapters.primary.rest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrganizationTO {
    private long id;

    private String name;

    private String place;

    private String description;

    private OrganizationInvitationCodeTO organizationInvitationCode;

    private List<PersonOfOrganizationTO> personsOfOrganization;
}
