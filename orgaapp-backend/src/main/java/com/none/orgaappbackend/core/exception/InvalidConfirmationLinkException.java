package com.none.orgaappbackend.core.exception;

public class InvalidConfirmationLinkException extends RuntimeException{
    public InvalidConfirmationLinkException(){
        super("Der Link ist nicht mehr gültig!");
    }
}
