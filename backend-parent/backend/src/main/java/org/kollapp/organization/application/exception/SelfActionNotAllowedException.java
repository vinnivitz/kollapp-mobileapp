package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class SelfActionNotAllowedException extends AbstractLocalizedException {
    public SelfActionNotAllowedException(MessageSource messageSource) {
        super(messageSource, "error.organization.self-action-not-allowed");
    }
}
