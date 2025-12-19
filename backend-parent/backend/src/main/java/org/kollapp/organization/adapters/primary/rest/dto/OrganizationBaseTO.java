package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class OrganizationBaseTO {
    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private String place;
}
