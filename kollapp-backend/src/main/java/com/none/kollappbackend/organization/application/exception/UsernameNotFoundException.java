package com.none.kollappbackend.organization.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class UsernameNotFoundException extends AbstractLocalizedException {
    public UsernameNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.username.not-found");
    }
}
