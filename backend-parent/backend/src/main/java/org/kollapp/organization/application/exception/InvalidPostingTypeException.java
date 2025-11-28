package org.kollappbackend.organization.application.exception;

public class InvalidPostingTypeException extends RuntimeException {
    public InvalidPostingTypeException() {
        super("Invalid posting type.");
    }
}
