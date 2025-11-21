package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class OrganizationNotFoundException extends AbstractLocalizedException {
    public OrganizationNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.organization.not-found");
    }
}
