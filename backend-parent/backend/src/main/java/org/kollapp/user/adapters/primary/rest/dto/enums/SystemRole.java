package org.kollapp.user.adapters.primary.rest.dto.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import org.kollapp.user.application.exception.InvalidSystemRoleException;

public enum SystemRole {
    ROLE_KOLLAPP_ADMIN,
    ROLE_KOLLAPP_USER,
    ROLE_KOLLAPP_ORGANIZATION_MEMBER;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static SystemRole fromString(String value) {
        if (value == null) {
            return null;
        }
        for (SystemRole role : SystemRole.values()) {
            if (role.name().equals(value)) {
                return role;
            }
        }
        throw new InvalidSystemRoleException();
    }
}
