package com.none.kollappbackend.organization.application.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientPlatform {
    ANDROID("Android"),
    IOS("iPhone"),
    WEB("Web");

    private String platformName;
}