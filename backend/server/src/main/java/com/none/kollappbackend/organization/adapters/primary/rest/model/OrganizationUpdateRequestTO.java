package com.none.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class OrganizationUpdateRequestTO {
    @NotBlank(message = "{validation.organization.name.required}")
    @Size(max = 255, message = "{validation.organization.name.maxlength}")
    private String name;
}
