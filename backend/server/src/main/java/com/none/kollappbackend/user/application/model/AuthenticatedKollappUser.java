package com.none.kollappbackend.user.application.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AuthenticatedKollappUser {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String email;
    private long loggedInUntil;
}
