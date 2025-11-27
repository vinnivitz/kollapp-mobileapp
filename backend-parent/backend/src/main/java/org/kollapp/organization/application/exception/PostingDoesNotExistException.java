package org.kollapp.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class PostingDoesNotExistException extends AbstractLocalizedException {
    public PostingDoesNotExistException(MessageSource messageSource) {
        super(messageSource, "error.organization.posting.not-found");
    }
}
