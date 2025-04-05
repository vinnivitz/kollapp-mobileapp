package org.kollappbackend.accounting.adapters.primary.rest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kollappbackend.accounting.application.model.PostingType;

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

    private long activityId;
}

