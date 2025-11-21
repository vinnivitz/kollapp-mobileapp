package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class PersonNotRegisteredInOrganizationException extends AbstractLocalizedException {
    public PersonNotRegisteredInOrganizationException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-not-found");
    }
}
