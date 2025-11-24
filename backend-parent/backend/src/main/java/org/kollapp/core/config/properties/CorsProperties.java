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
@ConfigurationProperties(prefix = "kollapp.cors")
public class CorsProperties {
    private String allowedOriginPattern;
    private String allowedMethods;
    private String allowedHeaders;
    private String exposedHeaders;
    private String allowCredentials;
}
