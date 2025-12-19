package org.kollapp.user.application.exception;

public class InvalidSystemRoleException extends RuntimeException {
    public InvalidSystemRoleException() {
        super("Invalid system role.");
    }
}
