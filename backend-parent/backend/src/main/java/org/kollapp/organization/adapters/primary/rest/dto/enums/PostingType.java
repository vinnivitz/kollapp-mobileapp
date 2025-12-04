package org.kollapp.organization.adapters.primary.rest.dto.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import org.kollapp.organization.application.exception.InvalidPostingTypeException;

public enum PostingType {
    DEBIT,
    CREDIT;

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
