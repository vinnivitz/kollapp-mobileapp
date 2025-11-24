package org.kollapp.core.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientPlatform {
    ANDROID("Android"),
    WEB("Web");

    private final String platformName;
}
