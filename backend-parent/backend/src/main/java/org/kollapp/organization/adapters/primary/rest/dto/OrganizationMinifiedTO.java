package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class OrganizationMinifiedTO {
    @NotNull
    private long id;

    @NotNull
    private String name;

    private String description;

    @NotNull
    private String place;
}
