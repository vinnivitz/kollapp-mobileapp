package org.kollappbackend.accounting.application.exception;

public class BudgetAccountDoesNotExistException extends RuntimeException {
    public BudgetAccountDoesNotExistException() {
        super("There is no budget account with this id.");
    }
}
