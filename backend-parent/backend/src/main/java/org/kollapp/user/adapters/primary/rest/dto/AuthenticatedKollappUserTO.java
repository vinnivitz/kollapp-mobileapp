package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

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
    @NotNull
    private String accessToken;

    @NotNull
    private String refreshToken;

    @NotNull
    private String username;

    @NotNull
    private String email;

    @NotNull
    private long loggedInUntil;
}
