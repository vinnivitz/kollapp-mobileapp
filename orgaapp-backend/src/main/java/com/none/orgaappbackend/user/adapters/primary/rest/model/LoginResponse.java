package com.none.orgaappbackend.user.adapters.primary.rest.model;

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
    private String role;
    private String name;
    private String surname;
    private long loggedInUntil;
}
