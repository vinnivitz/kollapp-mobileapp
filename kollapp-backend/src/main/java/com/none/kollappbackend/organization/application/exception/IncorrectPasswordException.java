package com.none.kollappbackend.organization.application.exception;

public class IncorrectPasswordException extends RuntimeException {
    public IncorrectPasswordException(){
        super("Das Passwort ist nicht korrekt!");
    }
}
