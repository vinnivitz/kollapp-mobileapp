package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.organization.application.model.OrganizationRole;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonOfOrganizationPatchRoleRequestTO {
    @NotNull(message = "{validation.organization.role.required}")
    private OrganizationRole role;
}
