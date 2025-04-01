package org.kollappbackend.organization.adapters.primary.rest.model;

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
