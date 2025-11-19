package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class LastManagerException extends AbstractLocalizedException {
    public LastManagerException(MessageSource messageSource) {
        super(messageSource, "error.organization.lastmanager");
    }
}
