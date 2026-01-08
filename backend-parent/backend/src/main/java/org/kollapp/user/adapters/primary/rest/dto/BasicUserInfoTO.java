package org.kollapp.user.adapters.primary.rest.dto;

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
public class BasicUserInfoTO {
    @NotNull
    private String username;

    @NotNull
    private List<Long> commonOrganizationIds;
}
