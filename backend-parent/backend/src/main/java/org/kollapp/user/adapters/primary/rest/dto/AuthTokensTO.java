package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthTokensTO {
    @NotNull
    private String accessToken;

    @NotNull
    private String refreshToken;
}
