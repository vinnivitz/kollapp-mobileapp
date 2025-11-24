package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class PersonAlreadyRegisteredInOrganizationException extends AbstractLocalizedException {
    public PersonAlreadyRegisteredInOrganizationException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-already-registered");
    }
}
