package org.kollappbackend.accounting.application.exception;

public class NoPostingWithThisIdException extends RuntimeException {
    public NoPostingWithThisIdException() {
        super("No posting with this id exists");
    }
}
