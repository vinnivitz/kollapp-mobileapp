package org.kollappbackend.accounting.application.exception;

public class OrganizationHasNoBudgetAccount extends RuntimeException {
    public OrganizationHasNoBudgetAccount() {
        super("Organization has no budget account");
    }
}
