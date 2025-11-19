package org.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationCreationRequestTO {

    @NotBlank(message = "{validation.organization.name.required}")
    @Size(max = 255, message = "{validation.organization.name.maxlength}")
    private String name;

    @NotBlank(message = "{validation.organization.place.required}")
    @Size(max = 255, message = "{validation.organization.place.maxlength}")
    private String place;

    private String description;
}
