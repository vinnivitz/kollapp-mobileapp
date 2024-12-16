package com.none.kollappbackend.organization.adapters.primary.rest.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrganizationSignupRequest {
    String username;
    String name;
    String email;
    String password;
}
