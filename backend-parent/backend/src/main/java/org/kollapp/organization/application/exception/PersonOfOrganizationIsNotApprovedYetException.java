package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class PersonOfOrganizationIsNotApprovedYetException extends AbstractLocalizedException {
    public PersonOfOrganizationIsNotApprovedYetException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-not-approved");
    }
}
