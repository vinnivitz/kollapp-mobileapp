package com.none.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityTO {
    private long id;

    private String name;

    private String location;
}
