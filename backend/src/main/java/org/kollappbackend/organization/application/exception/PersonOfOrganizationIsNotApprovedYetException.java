package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PersonOfOrganizationIsNotApprovedYetException extends AbstractLocalizedException {
    public PersonOfOrganizationIsNotApprovedYetException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-not-approved");
    }
}
