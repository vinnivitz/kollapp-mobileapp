package com.none.kollappbackend.user.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class KollappUserNotFoundException extends AbstractLocalizedException {
    public KollappUserNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.organization.not-found");
    }
}
