package org.kollappbackend.organization.adapters.primary.rest.model;

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
public class PersonOfOrganizationTO {
    private long id;
    private String username;
    private String role;
    private String status;
}
