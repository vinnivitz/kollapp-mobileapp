package org.kollappbackend.organization.application.model;

import org.kollappbackend.organization.application.exception.InvalidOrganizationRoleException;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum OrganizationRole {
    ROLE_ORGANIZATION_MEMBER, ROLE_ORGANIZATION_MANAGER;

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
