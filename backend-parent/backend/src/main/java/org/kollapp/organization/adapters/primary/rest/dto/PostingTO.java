package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

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

    private long id;

    private PostingType type;

    @NotNull(message = "{validation.posting.amount.required}")
    @Min(value = 0, message = "{validation.posting.amount.min}")
    private long amountInCents;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "{validation.posting.date.format}")
    private String date;

    private String purpose;
}
