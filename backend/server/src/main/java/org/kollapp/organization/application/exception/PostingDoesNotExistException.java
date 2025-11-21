package org.kollapp.organization.application.exception;

public class PostingDoesNotExistException extends RuntimeException {
    public PostingDoesNotExistException() {
        super("No posting with this id exists");
    }
}
