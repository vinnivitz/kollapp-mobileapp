package org.kollappbackend.organization.application.model;

import org.kollappbackend.organization.application.exception.InvalidPostingTypeException;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PostingType {
    DEBIT, CREDIT;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static PostingType fromString(String value) {
        if (value == null) {
            return null;
        }
        for (PostingType type : PostingType.values()) {
            if (type.name().equals(value)) {
                return type;
            }
        }
        throw new InvalidPostingTypeException();
    }
}
