package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PersonAlreadyRegisteredInOrganizationException extends AbstractLocalizedException {
    public PersonAlreadyRegisteredInOrganizationException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-already-registered");
    }
}
