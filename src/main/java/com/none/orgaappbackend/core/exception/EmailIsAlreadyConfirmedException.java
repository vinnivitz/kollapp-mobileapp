package com.none.orgaappbackend.core.exception;

public class EmailIsAlreadyConfirmedException extends RuntimeException{
    public EmailIsAlreadyConfirmedException(){
        super("Die E-Mail-Adresse wurde bereits bestätigt!");
    }
}
