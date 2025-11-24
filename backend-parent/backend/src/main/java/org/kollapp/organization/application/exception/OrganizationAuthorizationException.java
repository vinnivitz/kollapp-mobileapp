package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class OrganizationAuthorizationException extends AbstractLocalizedException {
    public OrganizationAuthorizationException(MessageSource messageSource) {
        super(messageSource, "error.authorization");
    }
}
