package org.kollapp.organization.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.organization.application.model.PostingType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostingTO {

    private long id;

    private PostingType type;

    private long amountInCents;

    private String date;

    private String purpose;
}
