package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.core.validation.ValidDate;
import org.kollapp.organization.adapters.primary.rest.dto.enums.PostingType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostingCreateUpdateRequestTO {

    @NotNull(message = "{validation.posting.type.required}")
    private PostingType type;

    @NotNull(message = "{validation.posting.amount.required}")
    @Min(value = 1, message = "{validation.posting.amount.min}")
    @Max(value = 10_000_000, message = "{validation.posting.amount.max}")
    private long amountInCents;

    @NotNull(message = "{validation.posting.date.required}")
    @ValidDate(message = "{validation.posting.date.format}")
    private String date;

    @Size(max = 50, message = "{validation.posting.purpose.maxlength}")
    private String purpose;
}
