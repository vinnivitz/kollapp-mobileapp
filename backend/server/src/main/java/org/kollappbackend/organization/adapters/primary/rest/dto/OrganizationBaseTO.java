package org.kollappbackend.organization.adapters.primary.rest.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class OrganizationBaseTO {
    private String name;
    private String description;
    private String place;
}
