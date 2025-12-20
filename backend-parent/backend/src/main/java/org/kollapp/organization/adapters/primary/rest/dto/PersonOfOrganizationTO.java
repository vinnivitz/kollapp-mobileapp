package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

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
    @NotNull
    private long id;

    @NotNull
    private long userId;

    @NotNull
    private String username;

    @NotNull
    private OrganizationRole organizationRole;

    @NotNull
    private String status;
}
