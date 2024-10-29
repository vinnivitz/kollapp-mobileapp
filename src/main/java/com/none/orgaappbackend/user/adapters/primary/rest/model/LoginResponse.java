package com.none.orgaappbackend.user.adapters.primary.rest.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private String name;
    private String surname;
    private long loggedInUntil;
}
