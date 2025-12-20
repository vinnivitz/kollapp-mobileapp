package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.user.application.model.SystemRole;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KollappUserTO {
    @NotNull
    private long id;

    @NotNull
    private String username;

    @NotNull
    private String email;

    @NotNull
    private boolean activated;

    @NotNull
    private SystemRole role;
}
