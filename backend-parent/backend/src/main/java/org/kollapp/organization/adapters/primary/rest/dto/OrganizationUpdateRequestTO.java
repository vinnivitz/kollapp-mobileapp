package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

import org.kollapp.core.jackson.Trimmed;

@Getter
@Setter
public class OrganizationUpdateRequestTO {
    @NotBlank(message = "{validation.organization.name.required}")
    @Size(max = 50, message = "{validation.organization.name.maxlength}")
    @Trimmed
    private String name;

    @Size(max = 255, message = "{validation.organization.description.maxlength}")
    @Trimmed
    private String description;

    @NotBlank(message = "{validation.organization.place.required}")
    @Size(max = 50, message = "{validation.organization.place.maxlength}")
    @Trimmed
    private String place;
}
