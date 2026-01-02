package org.kollapp.organization.adapters.primary.rest.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityTO {
    @NotNull
    private long id;

    @NotNull
    private String name;

    @NotNull
    private String location;

    @NotNull
    private String date;

    @NotNull
    private List<PostingTO> activityPostings;
}
