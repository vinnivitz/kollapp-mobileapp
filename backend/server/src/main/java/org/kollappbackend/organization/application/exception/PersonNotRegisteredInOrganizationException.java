package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PersonNotRegisteredInOrganizationException extends AbstractLocalizedException {
    public PersonNotRegisteredInOrganizationException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-not-found");
    }
}
