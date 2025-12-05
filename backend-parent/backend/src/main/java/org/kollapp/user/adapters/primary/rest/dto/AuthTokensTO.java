package org.kollapp.user.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthTokensTO {
    private String accessToken;

    private String refreshToken;
}
