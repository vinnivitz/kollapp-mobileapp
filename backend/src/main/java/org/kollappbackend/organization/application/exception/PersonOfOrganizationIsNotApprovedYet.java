package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PersonOfOrganizationIsNotApprovedYet extends AbstractLocalizedException {
    public PersonOfOrganizationIsNotApprovedYet(MessageSource messageSource) {
        super(messageSource, "error.organization.person-not-approved");
    }
}
