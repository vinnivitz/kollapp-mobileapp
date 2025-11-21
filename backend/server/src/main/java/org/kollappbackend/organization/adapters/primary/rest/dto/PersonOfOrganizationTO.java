package org.kollappbackend.organization.adapters.primary.rest.dto;

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
public class PersonOfOrganizationTO {
    private long id;
    private long userId;
    private String username;
    private String organizationRole;
    private String status;
}
