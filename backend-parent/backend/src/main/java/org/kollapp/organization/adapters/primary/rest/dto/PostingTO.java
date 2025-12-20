package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.organization.adapters.primary.rest.dto.enums.PostingType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostingTO {
    @NotNull
    private long id;

    @NotNull
    private PostingType type;

    @NotNull
    private long amountInCents;

    @NotNull
    private String date;

    @NotNull
    private String purpose;
}
