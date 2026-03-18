package org.kollapp.core.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "kollapp.jwt")
public class JwtProperties {
    private String authSecret;
    private long authExpirationInSeconds;
    private String refreshSecret;
    private long refreshExpirationInSeconds;
    private String confirmationSecret;
    private long confirmationExpirationInSeconds;
    private String newEmailConfirmationSecret;
    private long newEmailConfirmationExpirationInSeconds;
    private String resetPasswordSecret;
    private long resetPasswordExpirationInSeconds;
}
