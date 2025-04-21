package org.kollappbackend.accounting.application.exception;

public class BudgetAccountDoesNotContainPostingException extends RuntimeException {
    public BudgetAccountDoesNotContainPostingException() {
        super("The posting does not belong to this budget account");
    }
}
