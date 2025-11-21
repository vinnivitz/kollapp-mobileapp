package org.kollappbackend.organization.adapters.primary.rest.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private List<ActivityTO> activities;

    private List<PostingTO> organizationPostings;
}
