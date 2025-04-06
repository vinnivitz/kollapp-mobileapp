package org.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrganizationTO {
    private long id;

    @NotBlank(message = "{validation.organization.name.required}")
    @Size(max = 255, message = "{validation.organization.name.maxlength}")
    private String name;
}
