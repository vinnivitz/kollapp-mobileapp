package org.kollapp.organization.adapters.primary.rest.dto.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import org.kollapp.organization.application.exception.InvalidOrganizationRoleException;

public enum OrganizationRole {
    ROLE_ORGANIZATION_MEMBER,
    ROLE_ORGANIZATION_MANAGER;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static OrganizationRole fromString(String value) {
        if (value == null) {
            return null;
        }
        for (OrganizationRole role : OrganizationRole.values()) {
            if (role.name().equals(value)) {
                return role;
            }
        }
        throw new InvalidOrganizationRoleException();
    }
}
