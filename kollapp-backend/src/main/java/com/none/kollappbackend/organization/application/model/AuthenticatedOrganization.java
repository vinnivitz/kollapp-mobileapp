package com.none.kollappbackend.organization.application.model;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AuthenticatedOrganization {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String email;
    private String name;
    private long loggedInUntil;
}
