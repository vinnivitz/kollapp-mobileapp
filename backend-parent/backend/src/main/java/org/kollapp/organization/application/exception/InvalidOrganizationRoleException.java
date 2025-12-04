package org.kollapp.organization.application.exception;

public class InvalidOrganizationRoleException extends RuntimeException {
    public InvalidOrganizationRoleException() {
        super("Invalid organization role.");
    }
}
