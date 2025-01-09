package com.none.kollappbackend.organization.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class UsernameExistsException extends AbstractLocalizedException {
    public UsernameExistsException(MessageSource messageSource) {
        super(messageSource, "error.username.exists");
    }
}
