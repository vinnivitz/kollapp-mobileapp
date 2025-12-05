package org.kollapp.user.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticatedKollappUserTO {
    private String accessToken;

    private String refreshToken;

    private String username;

    private String email;

    private long loggedInUntil;
}
