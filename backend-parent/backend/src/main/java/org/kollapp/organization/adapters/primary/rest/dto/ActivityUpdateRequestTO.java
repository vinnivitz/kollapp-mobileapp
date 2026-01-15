package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
    @Size(max = 50, message = "{validation.activity.name.maxlength}")
    private String name;

    @NotBlank(message = "{validation.activity.location.required}")
    @Size(max = 50, message = "{validation.activity.location.maxlength}")
    private String location;

    @NotNull(message = "{validation.activity.date.required}")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "{validation.activity.date.format}")
    private String date;
}
