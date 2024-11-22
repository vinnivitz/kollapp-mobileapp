package com.none.orgaappbackend.core.exception;

public class IncorrectPasswordException extends RuntimeException {
    public IncorrectPasswordException(){
        super("Das Passwort ist nicht korrekt!");
    }
}
