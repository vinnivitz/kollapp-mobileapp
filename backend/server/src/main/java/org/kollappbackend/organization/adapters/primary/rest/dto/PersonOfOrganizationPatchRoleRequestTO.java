package org.kollappbackend.organization.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kollappbackend.organization.application.model.OrganizationRole;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonOfOrganizationPatchRoleRequestTO {
    private OrganizationRole role;
}
