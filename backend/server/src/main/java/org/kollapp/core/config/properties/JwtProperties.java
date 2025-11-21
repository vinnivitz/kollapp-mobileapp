package org.kollapp.core.config.properties;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "kollapp.jwt")
@Validated
public class JwtProperties {
    @NotBlank(message = "JWT auth secret must be configured")
    private String authSecret;

    private long authExpirationInSeconds;

    @NotBlank(message = "JWT refresh secret must be configured")
    private String refreshSecret;

    private long refreshExpirationInSeconds;

    @NotBlank(message = "JWT confirmation secret must be configured")
    private String confirmationSecret;

    private long confirmationExpirationInSeconds;

    @NotBlank(message = "JWT reset password secret must be configured")
    private String resetPasswordSecret;

    private long resetPasswordExpirationInSeconds;
}
