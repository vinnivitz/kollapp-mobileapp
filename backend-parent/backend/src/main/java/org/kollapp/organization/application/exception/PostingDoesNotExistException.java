package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class PostingDoesNotExistException extends AbstractLocalizedException {
    public PostingDoesNotExistException(MessageSource messageSource) {
        super(messageSource, "error.organization.posting.not-found");
    }
}
