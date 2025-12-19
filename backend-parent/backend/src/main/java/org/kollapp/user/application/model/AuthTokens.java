package org.kollapp.user.application.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthTokens {
    private String accessToken;
    private String refreshToken;
}
