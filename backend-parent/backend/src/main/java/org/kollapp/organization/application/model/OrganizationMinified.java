package org.kollapp.organization.application.model;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class OrganizationMinified {
    @NotNull
    private long id;

    @NotNull
    private String name;

    private String description;

    @NotNull
    private String place;

    @NotNull
    private OrganizationMembershipState state;
}
