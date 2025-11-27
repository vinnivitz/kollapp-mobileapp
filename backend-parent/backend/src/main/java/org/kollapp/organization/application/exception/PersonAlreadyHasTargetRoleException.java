package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class PersonAlreadyHasTargetRoleException extends AbstractLocalizedException {
    public PersonAlreadyHasTargetRoleException(MessageSource messageSource) {
        super(messageSource, "error.organization.person-already-has-target-role");
    }
}
