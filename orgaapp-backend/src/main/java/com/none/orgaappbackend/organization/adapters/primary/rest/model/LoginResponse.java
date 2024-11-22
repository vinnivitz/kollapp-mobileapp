package com.none.orgaappbackend.organization.adapters.primary.rest.model;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String email;
    private String name;
    private long loggedInUntil;
}
