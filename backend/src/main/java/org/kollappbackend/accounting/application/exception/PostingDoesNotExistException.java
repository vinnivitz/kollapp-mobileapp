package org.kollappbackend.accounting.application.exception;

public class PostingDoesNotExistException extends RuntimeException {
    public PostingDoesNotExistException() {
        super("No posting with this id exists");
    }
}
