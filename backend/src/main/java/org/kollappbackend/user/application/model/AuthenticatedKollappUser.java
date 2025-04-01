package org.kollappbackend.user.application.model;

import lombok.*;

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
