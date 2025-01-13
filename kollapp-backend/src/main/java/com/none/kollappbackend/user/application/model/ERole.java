package com.none.kollappbackend.user.application.model;

import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Getter
public enum ERole {
    ROLE_ADMIN("ADMIN"),
    ROLE_MANAGER("MANAGER"),
    ROLE_MEMBER("MEMBER");

    private final String role;

    ERole(String role) {
        this.role = role;
    }
}