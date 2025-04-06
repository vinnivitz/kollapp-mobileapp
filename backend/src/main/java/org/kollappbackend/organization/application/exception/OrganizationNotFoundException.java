package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class OrganizationNotFoundException extends AbstractLocalizedException {
    public OrganizationNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.organization.not-found");
    }
}
