package com.none.orgaappbackend.organization.application.exception;

public class UsernameIsAlreadyInUseException extends RuntimeException {
    public UsernameIsAlreadyInUseException() {
        super("Der Benutzername ist bereits vergeben!");
    }
}
