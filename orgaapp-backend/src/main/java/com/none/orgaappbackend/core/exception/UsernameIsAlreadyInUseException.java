package com.none.orgaappbackend.core.exception;

public class UsernameIsAlreadyInUseException extends RuntimeException {
    public UsernameIsAlreadyInUseException() {
        super("Der Benutzername ist bereits vergeben!");
    }
}
