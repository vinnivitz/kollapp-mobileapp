package org.kollapp.organization.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.organization.adapters.primary.rest.dto.enums.OrganizationRole;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonOfOrganizationTO {
    private long id;
    private long userId;
    private String username;
    private OrganizationRole organizationRole;
    private String status;
}
