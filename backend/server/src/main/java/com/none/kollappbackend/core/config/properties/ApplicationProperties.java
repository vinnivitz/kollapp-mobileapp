package com.none.kollappbackend.core.config.properties;

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
@ConfigurationProperties(prefix = "kollapp.application")
public class ApplicationProperties {
    private String domain;
    private String host;
    private String production;
    private String version;
    private String port;
    private int staticCacheDays;
}
