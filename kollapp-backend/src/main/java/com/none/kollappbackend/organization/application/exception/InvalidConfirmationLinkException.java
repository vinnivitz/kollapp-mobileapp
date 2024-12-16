package com.none.kollappbackend.organization.application.exception;

public class InvalidConfirmationLinkException extends RuntimeException{
    public InvalidConfirmationLinkException(){
        super("Der Link ist nicht mehr gültig!");
    }
}
