package org.kollappbackend.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationUpdateRequestTO {
    @NotBlank(message = "{validation.organization.name.required}")
    @Size(max = 255, message = "{validation.organization.name.maxlength}")
    private String name;

    @NotBlank(message = "{validation.organization.description.required}")
    @Size(max = 255, message = "{validation.organization.description.maxlength}")
    private String description;

    @NotBlank(message = "{validation.organization.place.required}")
    @Size(max = 255, message = "{validation.organization.place.maxlength}")
    private String place;
}
