package org.kollapp.organization.adapters.primary.rest.dto;

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
public class ActivityCreationRequestTO {
    @NotBlank(message = "{validation.activity.name.required}")
    @Size(max = 50, message = "{validation.activity.name.maxlength}")
    private String name;

    @NotBlank(message = "{validation.activity.location.required}")
    @Size(max = 50, message = "{validation.activity.location.maxlength}")
    private String location;
}
