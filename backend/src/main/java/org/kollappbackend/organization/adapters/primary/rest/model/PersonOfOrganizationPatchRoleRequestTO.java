package org.kollappbackend.organization.adapters.primary.rest.model;

import org.kollappbackend.organization.application.model.OrganizationRole;

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
public class PersonOfOrganizationPatchRoleRequestTO {
    private OrganizationRole role;
}
