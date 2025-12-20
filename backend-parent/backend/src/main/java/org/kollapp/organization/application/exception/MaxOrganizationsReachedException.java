package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class MaxOrganizationsReachedException extends AbstractLocalizedException {
    public MaxOrganizationsReachedException(MessageSource messageSource) {
        super(messageSource, "error.organization.max-organizations-reached");
    }
}
