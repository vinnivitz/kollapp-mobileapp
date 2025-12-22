package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.core.jackson.Trimmed;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityUpdateRequestTO {
    @NotBlank(message = "{validation.activity.name.required}")
    @Size(max = 50, message = "{validation.activity.name.maxlength}")
    @Trimmed
    private String name;

    @NotBlank(message = "{validation.activity.location.required}")
    @Size(max = 50, message = "{validation.activity.location.maxlength}")
    @Trimmed
    private String location;
}
