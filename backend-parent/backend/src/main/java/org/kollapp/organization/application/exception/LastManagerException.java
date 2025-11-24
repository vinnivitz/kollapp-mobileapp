package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class LastManagerException extends AbstractLocalizedException {
    public LastManagerException(MessageSource messageSource) {
        super(messageSource, "error.organization.lastmanager");
    }
}
