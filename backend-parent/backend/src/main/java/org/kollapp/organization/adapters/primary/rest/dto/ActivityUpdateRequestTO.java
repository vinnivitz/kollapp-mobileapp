package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityUpdateRequestTO {

    @NotBlank(message = "{validation.activity.name.required}")
    private String name;

    @NotBlank(message = "{validation.activity.location.required}")
    private String location;
}
