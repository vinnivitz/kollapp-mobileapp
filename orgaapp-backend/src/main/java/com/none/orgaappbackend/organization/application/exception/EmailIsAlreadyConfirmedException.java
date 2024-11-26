package com.none.orgaappbackend.organization.application.exception;

public class EmailIsAlreadyConfirmedException extends RuntimeException{
    public EmailIsAlreadyConfirmedException(){
        super("Die E-Mail-Adresse wurde bereits bestätigt!");
    }
}
