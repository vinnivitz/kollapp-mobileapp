package com.none.kollappbackend.organization.application.exception;

public class UsernameIsAlreadyInUseException extends RuntimeException {
    public UsernameIsAlreadyInUseException() {
        super("Der Benutzername ist bereits vergeben!");
    }
}
