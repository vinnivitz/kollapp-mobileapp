package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PersonAlreadyHasTargetRoleException extends AbstractLocalizedException {
    public PersonAlreadyHasTargetRoleException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-already-has-target-role");
    }
}
