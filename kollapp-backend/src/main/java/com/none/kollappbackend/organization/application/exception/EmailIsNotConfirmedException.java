package com.none.kollappbackend.organization.application.exception;

public class EmailIsNotConfirmedException extends RuntimeException {
    public EmailIsNotConfirmedException() {
        super("Die E-Mail-Adresse ist noch nicht bestätigt!");
    }
}
