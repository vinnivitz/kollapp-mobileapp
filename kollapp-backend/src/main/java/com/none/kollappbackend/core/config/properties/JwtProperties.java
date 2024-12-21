package com.none.kollappbackend.core.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "kollapp.jwt")
public class JwtProperties {
    String authSecret;
    long authExpirationInSeconds;

    String refreshSecret;
    long refreshExpirationInSeconds;

    String confirmationSecret;
    long confirmationExpirationInSeconds;
}
