package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class OrganizationAuthorizationException extends AbstractLocalizedException {
    public OrganizationAuthorizationException(MessageSource messageSource) {
        super(messageSource, "error.authorization");
    }
}
